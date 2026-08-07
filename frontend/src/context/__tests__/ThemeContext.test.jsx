import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "../ThemeContext.jsx";

function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("earth")}>Set Earth</button>
      <button onClick={() => setTheme("invalid-theme")}>Set Invalid</button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults theme to earth and sets data-theme attribute on documentElement", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("earth");
    expect(document.documentElement.getAttribute("data-theme")).toBe("earth");
  });

  it("reads stored theme from localStorage on initialization", () => {
    localStorage.setItem("littora_theme", "dark");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("updates theme to dark and earth, updating localStorage and data-theme attribute", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Set Dark"));
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("littora_theme")).toBe("dark");

    fireEvent.click(screen.getByText("Set Earth"));
    expect(screen.getByTestId("current-theme").textContent).toBe("earth");
    expect(document.documentElement.getAttribute("data-theme")).toBe("earth");
  });

  it("ignores invalid theme values in setTheme", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Set Invalid"));
    expect(screen.getByTestId("current-theme").textContent).toBe("earth");
  });

  it("fallback safe defaults when useTheme is called outside <ThemeProvider>", () => {
    let result;
    function StandaloneConsumer() {
      result = useTheme();
      return null;
    }
    render(<StandaloneConsumer />);
    expect(result.theme).toBe("earth");
    expect(typeof result.setTheme).toBe("function");
  });
});
