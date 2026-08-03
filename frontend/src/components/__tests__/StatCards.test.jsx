import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatCards from "../StatCards.jsx";

// ─────────────────────────────────────────────────────────────────────────────
describe("StatCards component", () => {
  it("renders all four stat cards", () => {
    render(
      <StatCards
        totalAnalyses={42}
        totalWasteAllTime={158}
        avgScore={37}
        severityCounts={{ Low: 20, Moderate: 12, High: 7, Severe: 3 }}
      />
    );

    expect(screen.getByText("Total Detections")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();

    expect(screen.getByText("Total Waste Items")).toBeInTheDocument();
    expect(screen.getByText("158")).toBeInTheDocument();
  });

  it("renders with zero values without crashing", () => {
    render(
      <StatCards
        totalAnalyses={0}
        totalWasteAllTime={0}
        avgScore={0}
        severityCounts={{}}
      />
    );

    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("uses default prop values when none are provided", () => {
    render(<StatCards />);
    // Should render without crashing; all values default to 0
    expect(screen.getByText("Total Detections")).toBeInTheDocument();
  });

  it("formats large numbers with locale separators", () => {
    render(
      <StatCards
        totalAnalyses={1500}
        totalWasteAllTime={12000}
        avgScore={65}
        severityCounts={{ Low: 500, Moderate: 600, High: 300, Severe: 100 }}
      />
    );

    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getByText("12,000")).toBeInTheDocument();
  });
});
