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
import DatasetPage from "../DatasetPage.jsx";

function renderDataset() {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <AuthProvider>
          <StatsProvider>
            <DatasetPage />
          </StatsProvider>
        </AuthProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe("DatasetPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("renders Dataset Explorer title and dataset overview cards", async () => {
    renderDataset();
    await vi.waitFor(() => {
      expect(screen.getByRole("heading", { name: /dataset explorer/i })).toBeInTheDocument();
    });
  });
});
