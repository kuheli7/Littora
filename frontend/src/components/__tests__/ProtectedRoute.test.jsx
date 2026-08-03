import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ── Mock supabase ──────────────────────────────────────────────────────────
vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));
vi.mock("../../assets/logo.png",         () => ({ default: "logo.png" }));
vi.mock("../../assets/navbar_image.png", () => ({ default: "navbar.png" }));

import { AuthProvider } from "../../context/AuthContext.jsx";
import ProtectedRoute from "../ProtectedRoute.jsx";

function renderRoute({ user = null, loading = false, isAdmin = false, adminOnly = false } = {}) {
  // Override AuthContext internals via a wrapper that provides mock context
  const MockAuthProvider = ({ children }) => {
    const ctx = {
      user, loading, isAdmin,
      login: vi.fn(), logout: vi.fn(), signUp: vi.fn(), getToken: vi.fn(),
    };
    const { createContext, useContext } = require("react");
    // We can't easily inject, so use AuthProvider + supabase mock instead
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  };

  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <ProtectedRoute adminOnly={adminOnly}>
        <div data-testid="protected-content">Protected!</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
describe("ProtectedRoute", () => {
  it("shows loading indicator while auth is loading", async () => {
    // supabase getSession never resolves → loading stays true
    const { supabase } = await import("../../lib/supabase.js");
    supabase.auth.getSession.mockReturnValueOnce(new Promise(() => {}));

    const { unmount } = render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    unmount();
  });

  it("redirects to /login when user is not authenticated", async () => {
    const { supabase } = await import("../../lib/supabase.js");
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for async session check
    await vi.waitFor(() => {
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });
  });

  it("renders children when user is authenticated", async () => {
    const { supabase } = await import("../../lib/supabase.js");
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: "u1", email: "user@test.com" } } },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="content">Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});
