import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "../ThemeContext.jsx";

function TestComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("ocean")}>Set Ocean</button>
      <button onClick={() => setTheme("earth")}>Set Earth</button>
    </div>
  );
}

describe("ThemeContext & ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("provides 'earth' theme by default", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("earth");
    expect(document.documentElement.getAttribute("data-theme")).toBe("earth");
  });

  it("updates theme to 'light' and sets data-theme attribute on html", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Set Light"));

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("littora_theme")).toBe("light");
  });

  it("updates theme to 'ocean' and sets data-theme attribute on html", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Set Ocean"));

    expect(screen.getByTestId("current-theme").textContent).toBe("ocean");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
    expect(localStorage.getItem("littora_theme")).toBe("ocean");
  });

  it("restores theme from localStorage on initial render", () => {
    localStorage.setItem("littora_theme", "ocean");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme").textContent).toBe("ocean");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
  });
});
