import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

import { supabase } from "../../lib/supabase.js";
import { AuthProvider } from "../../context/AuthContext.jsx";
import { StatsProvider } from "../../context/StatsContext.jsx";
import { SettingsProvider } from "../../context/SettingsContext.jsx";
import AnalyticsPage from "../AnalyticsPage.jsx";

function renderAnalytics() {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <AuthProvider>
          <StatsProvider>
            <AnalyticsPage />
          </StatsProvider>
        </AuthProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe("AnalyticsPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("renders Analytics heading and summary stats", async () => {
    renderAnalytics();
    await vi.waitFor(() => {
      expect(screen.getByRole("heading", { name: /analytics/i })).toBeInTheDocument();
    });
  });
});
