/**
 * Integration tests for analyses routes
 * GET /api/analyses        — public paginated history
 * GET /api/stats           — aggregated dashboard stats
 * GET /health              — health check
 */
import { jest } from "@jest/globals";
import request from "supertest";

const mockListAnalyses = jest.fn();
const mockGetStats     = jest.fn();

jest.unstable_mockModule("../services/supabaseClient.js", () => ({
  supabase:              { auth: { getUser: jest.fn(), admin: { getUserById: jest.fn() } } },
  uploadImage:           jest.fn(),
  saveAnalysis:          jest.fn(),
  listAnalysesByUser:    jest.fn(),
  listAllAnalysesAdmin:  jest.fn(),
  deleteAnalysisForUser: jest.fn(),
  deleteAnalysis:        jest.fn(),
  listAnalyses:          mockListAnalyses,
  getStats:              mockGetStats,
}));

const { default: app } = await import("../index.js");

// ─────────────────────────────────────────────────────────────────────────────
describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/analyses", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with analyses array", async () => {
    const fakeData = [{ id: 1, severity: "Low" }, { id: 2, severity: "High" }];
    mockListAnalyses.mockResolvedValueOnce(fakeData);

    const res = await request(app).get("/api/analyses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeData);
  });

  it("passes default limit=50 and offset=0 to service", async () => {
    mockListAnalyses.mockResolvedValueOnce([]);
    await request(app).get("/api/analyses");
    expect(mockListAnalyses).toHaveBeenCalledWith({ limit: 50, offset: 0 });
  });

  it("passes custom limit and offset query params", async () => {
    mockListAnalyses.mockResolvedValueOnce([]);
    await request(app).get("/api/analyses?limit=10&offset=20");
    expect(mockListAnalyses).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });

  it("returns 500 when listAnalyses throws", async () => {
    mockListAnalyses.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app).get("/api/analyses");
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/could not fetch/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with stats object", async () => {
    const fakeStats = {
      totalAnalyses:    10,
      totalWasteAllTime: 50,
      avgScore:         35,
      severityCounts:   { Low: 4, Moderate: 3, High: 2, Severe: 1 },
      aggregateDetections: { bottle: 20, can: 15, bag: 10, wrapper: 5 },
      locations:        [],
      history:          [],
    };
    mockGetStats.mockResolvedValueOnce(fakeStats);

    const res = await request(app).get("/api/stats");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeStats);
  });

  it("returns 500 when getStats throws", async () => {
    mockGetStats.mockRejectedValueOnce(new Error("DB failure"));
    const res = await request(app).get("/api/stats");
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/could not fetch stats/i);
  });
});
