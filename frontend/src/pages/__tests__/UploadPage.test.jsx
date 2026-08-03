import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: { access_token: "tok", user: { id: "u1", email: "user@test.com" } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));
vi.mock("../../assets/logo.png",         () => ({ default: "logo.png" }));
vi.mock("../../assets/navbar_image.png", () => ({ default: "navbar.png" }));

// Mock StatsContext
vi.mock("../../context/StatsContext.jsx", () => ({
  useStats: () => ({ loadStats: vi.fn() }),
}));

// Mock UploadForm to avoid complex file input logic
vi.mock("../../components/UploadForm.jsx", () => ({
  default: ({ onUpload, loading }) => (
    <div>
      <button
        data-testid="mock-upload-btn"
        disabled={loading}
        onClick={() => onUpload(new File(["content"], "test.jpg", { type: "image/jpeg" }), null)}
      >
        Upload
      </button>
    </div>
  ),
}));

// Mock ResultPanel
vi.mock("../../components/ResultPanel.jsx", () => ({
  default: ({ result }) => (
    <div data-testid="result-panel">Score: {result.pollution_score}</div>
  ),
}));

import axios from "axios";
import { AuthProvider } from "../../context/AuthContext.jsx";
import UploadPage from "../UploadPage.jsx";

function renderUploadPage() {
  render(
    <AuthProvider>
      <UploadPage />
    </AuthProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
describe("UploadPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the page heading and upload + result panels", () => {
    renderUploadPage();
    expect(screen.getByRole("heading", { name: /detect waste/i })).toBeInTheDocument();
    expect(screen.getByTestId("mock-upload-btn")).toBeInTheDocument();
    expect(screen.getByText(/your analysis results will appear/i)).toBeInTheDocument();
  });

  it("shows detection result after successful upload", async () => {
    axios.post = vi.fn().mockResolvedValueOnce({
      data: {
        id:              "a1",
        image_url:       "https://example.com/img.jpg",
        detections:      { bottle: 2, can: 1, bag: 0, wrapper: 0 },
        total_waste:     3,
        pollution_score: 42,
        severity:        "Moderate",
      },
    });

    renderUploadPage();
    await vi.waitFor(() => screen.getByTestId("mock-upload-btn"));
    fireEvent.click(screen.getByTestId("mock-upload-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("result-panel")).toBeInTheDocument();
      expect(screen.getByText(/score: 42/i)).toBeInTheDocument();
    });
  });

  it("shows an error message when upload fails", async () => {
    axios.post = vi.fn().mockRejectedValueOnce({
      response: { data: { error: "AI service unavailable" } },
    });

    renderUploadPage();
    await vi.waitFor(() => screen.getByTestId("mock-upload-btn"));
    fireEvent.click(screen.getByTestId("mock-upload-btn"));

    await waitFor(() => {
      expect(screen.getByText(/ai service unavailable/i)).toBeInTheDocument();
    });
  });

  it("shows fallback error when error has no response", async () => {
    axios.post = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    renderUploadPage();
    await vi.waitFor(() => screen.getByTestId("mock-upload-btn"));
    fireEvent.click(screen.getByTestId("mock-upload-btn"));

    await waitFor(() => {
      expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
    });
  });

  it("disables the upload button while loading", async () => {
    let resolve;
    axios.post = vi.fn().mockReturnValueOnce(new Promise((r) => { resolve = r; }));

    renderUploadPage();
    await vi.waitFor(() => screen.getByTestId("mock-upload-btn"));
    fireEvent.click(screen.getByTestId("mock-upload-btn"));

    expect(screen.getByTestId("mock-upload-btn")).toBeDisabled();

    resolve({
      data: { id: "a1", image_url: "", detections: {}, total_waste: 0, pollution_score: 0, severity: "Low" },
    });
  });
});
