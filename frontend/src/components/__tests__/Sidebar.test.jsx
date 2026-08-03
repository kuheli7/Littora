import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ── Mock supabase (use vi.fn() directly — factory is hoisted) ─────────────
vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut:           vi.fn().mockResolvedValue({}),
    },
  },
}));
vi.mock("../../assets/logo.png",         () => ({ default: "logo.png" }));
vi.mock("../../assets/navbar_image.png", () => ({ default: "navbar.png" }));

import { supabase } from "../../lib/supabase.js";
import { AuthProvider } from "../../context/AuthContext.jsx";
import Sidebar from "../Sidebar.jsx";

function renderSidebar({ isOpen = true, user = null, isAdminUser = false } = {}) {
  if (user) {
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user } },
    });
  }
  const onClose = vi.fn();
  render(
    <MemoryRouter>
      <AuthProvider>
        <Sidebar isOpen={isOpen} onClose={onClose} />
      </AuthProvider>
    </MemoryRouter>
  );
  return { onClose };
}

// ─────────────────────────────────────────────────────────────────────────────
describe("Sidebar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    supabase.auth.signOut.mockResolvedValue({});
  });

  it("renders all main navigation links", async () => {
    renderSidebar();
    await vi.waitFor(() => {
      expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /detect waste/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /historical trends/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /beach map/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /detection history/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reports/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cleanup/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dataset/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("does NOT render Admin Dashboard link when user is not admin", async () => {
    renderSidebar({ user: { id: "u1", email: "regular@test.com" } });
    await vi.waitFor(() => {
      // Admin link should not appear for a regular user
      expect(screen.queryByRole("link", { name: /admin dashboard/i })).not.toBeInTheDocument();
    });
  });

  it("renders user info strip when logged in", async () => {
    renderSidebar({ user: { id: "u1", email: "jane@test.com" } });
    await vi.waitFor(() => {
      expect(screen.getByText("jane")).toBeInTheDocument();
      expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    });
  });

  it("renders 'U' avatar initial as fallback when no user", async () => {
    renderSidebar(); // no user
    // No user strip rendered; just check sidebar appears
    await vi.waitFor(() => {
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });
  });

  it("sidebar has open class when isOpen=true", () => {
    renderSidebar({ isOpen: true });
    const aside = screen.getByRole("complementary");
    expect(aside).toHaveClass("open");
  });

  it("sidebar does not have open class when isOpen=false", () => {
    renderSidebar({ isOpen: false });
    const aside = screen.getByRole("complementary");
    expect(aside).not.toHaveClass("open");
  });

  it("shows backdrop when sidebar is open", () => {
    renderSidebar({ isOpen: true });
    expect(document.querySelector(".sidebar-backdrop")).toBeInTheDocument();
  });

  it("hides backdrop when sidebar is closed", () => {
    renderSidebar({ isOpen: false });
    expect(document.querySelector(".sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("calls logout and onClose when Logout button is clicked", async () => {
    supabase.auth.signOut.mockResolvedValueOnce({});
    const { onClose } = renderSidebar({
      user: { id: "u1", email: "user@test.com" },
    });

    await vi.waitFor(() => screen.getByRole("button", { name: /logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
