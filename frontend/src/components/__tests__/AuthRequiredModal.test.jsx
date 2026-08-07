import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AuthRequiredModal from "../AuthRequiredModal.jsx";

describe("AuthRequiredModal component", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(<AuthRequiredModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders modal content when isOpen is true with custom feature name", () => {
    render(<AuthRequiredModal isOpen={true} onClose={vi.fn()} featureName="save detection history" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Sign In Required")).toBeInTheDocument();
    expect(screen.getByText(/save detection history/i)).toBeInTheDocument();
  });

  it("calls onClose when backdrop or close/cancel button is clicked", () => {
    const onClose = vi.fn();
    render(<AuthRequiredModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("calls onClose and redirects to /login when Sign In button is clicked", () => {
    const onClose = vi.fn();
    render(<AuthRequiredModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("/login");
  });
});
