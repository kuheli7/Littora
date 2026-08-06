import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession:        vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut:           vi.fn(),
    },
  },
}));

import { supabase } from "../../lib/supabase.js";
import { AuthProvider } from "../../context/AuthContext.jsx";
import { StatsProvider } from "../../context/StatsContext.jsx";
import { SettingsProvider } from "../../context/SettingsContext.jsx";
import { ThemeProvider } from "../../context/ThemeContext.jsx";
import SettingsPage from "../SettingsPage.jsx";

function setupAuthMock(user = null) {
  sessionStorage.clear();
  localStorage.clear();
  supabase.auth.getSession.mockReset();
  supabase.auth.onAuthStateChange.mockReset();

  const session = user ? { user } : null;
  supabase.auth.getSession.mockResolvedValue({ data: { session } });
  supabase.auth.onAuthStateChange.mockImplementation((cb) => {
    cb(user ? "SIGNED_IN" : "SIGNED_OUT", session);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
}

function renderSettings({ user = null } = {}) {
  setupAuthMock(user);
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <StatsProvider>
              <SettingsPage />
            </StatsProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("SettingsPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.signOut.mockResolvedValue({});
  });

  it("renders Settings title and general settings selectors", async () => {
    renderSettings({ user: null });
    await vi.waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
    expect(screen.getByText("General Settings")).toBeInTheDocument();
    expect(screen.getByLabelText(/select dark theme/i)).toBeInTheDocument();
  });

  it("shows guest preference notice card when unauthenticated", async () => {
    renderSettings({ user: null });
    await vi.waitFor(() => {
      expect(screen.getByText("👋 Guest Preferences Mode")).toBeInTheDocument();
    });
    expect(screen.getByText("Account & Notification Settings")).toBeInTheDocument();
    expect(screen.getByText(/sign in to unlock/i)).toBeInTheDocument();
  });

  it("renders notification preferences and data privacy sections when logged in", async () => {
    renderSettings({ user: { id: "u-settings", email: "user@test.com" } });
    await vi.waitFor(() => {
      expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
    });
    expect(screen.getByText("Data & Privacy")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("enables Save Changes button when settings are modified and saves settings", async () => {
    renderSettings({ user: null });
    await vi.waitFor(() => screen.getByLabelText(/select dark theme/i));

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    expect(saveBtn).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/select dark theme/i));
    expect(saveBtn).not.toBeDisabled();

    fireEvent.click(saveBtn);
    await vi.waitFor(() => {
      expect(screen.getByText(/settings saved successfully!/i)).toBeInTheDocument();
    });
  });

  it("opens delete confirmation modal when Delete button is clicked", async () => {
    renderSettings({ user: { id: "u-settings", email: "user@test.com" } });
    await vi.waitFor(() => screen.getByRole("button", { name: /delete/i }));

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText("Delete your account?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await vi.waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    });
  });
});
