/**
 * Unit tests for supabaseClient service functions
 * Tests the pure JS aggregation logic in getStats()
 * and the error-handling paths in deleteAnalysis / deleteAnalysisForUser.
 */
import { jest } from "@jest/globals";

// ── Mock Supabase SDK ─────────────────────────────────────────────────────────
// We build a chainable mock that covers .from().select().eq().order()...etc.
function makeQueryChain(resolved) {
  const chain = {
    select:   () => chain,
    eq:       () => chain,
    order:    () => chain,
    range:    () => chain,
    delete:   () => chain,
    insert:   () => chain,
    single:   () => Promise.resolve(resolved),
    then:     (cb) => Promise.resolve(resolved).then(cb),
  };
  return chain;
}

const mockFrom  = jest.fn();
const mockAdmin = { getUserById: jest.fn() };
const mockStorage = {
  from: jest.fn().mockReturnValue({
    upload:       jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/img.jpg" } }),
    remove:       jest.fn().mockResolvedValue({ error: null }),
  }),
};

jest.unstable_mockModule("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    from:    mockFrom,
    storage: mockStorage,
    auth:    { getUser: jest.fn(), admin: mockAdmin },
  }),
}));

jest.unstable_mockModule("ws", () => ({ default: class MockWS {} }));

const {
  getStats,
  listAnalyses,
  listAnalysesByUser,
  deleteAnalysis,
  deleteAnalysisForUser,
  uploadImage,
  saveAnalysis,
} = await import("../services/supabaseClient.js");

// ─────────────────────────────────────────────────────────────────────────────
describe("getStats — JS aggregation logic", () => {
  it("calculates totals and severity counts correctly", async () => {
    const rows = [
      {
        id: "1", total_waste: 5, pollution_score: 30, severity: "Low",
        latitude: null, longitude: null, location_label: null,
        detections: [{ waste_type: "bottle", count: 3 }, { waste_type: "can", count: 2 }],
      },
      {
        id: "2", total_waste: 10, pollution_score: 70, severity: "High",
        latitude: 19.076, longitude: 72.877, location_label: "Juhu",
        detections: [{ waste_type: "bag", count: 5 }, { waste_type: "wrapper", count: 5 }],
      },
      {
        id: "3", total_waste: 0, pollution_score: 0, severity: "Low",
        latitude: null, longitude: null, location_label: null,
        detections: [],
      },
    ];

    const chain = {
      select: jest.fn().mockReturnThis(),
      order:  jest.fn().mockResolvedValue({ data: rows, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const stats = await getStats();

    expect(stats.totalAnalyses).toBe(3);
    expect(stats.totalWasteAllTime).toBe(15);
    expect(stats.avgScore).toBe(Math.round((30 + 70 + 0) / 3));
    expect(stats.severityCounts).toEqual({ Low: 2, Moderate: 0, High: 1, Severe: 0 });
    expect(stats.aggregateDetections).toEqual({ bottle: 3, can: 2, bag: 5, wrapper: 5 });
    expect(stats.locations).toHaveLength(1);
    expect(stats.locations[0].location_label).toBe("Juhu");
    // history is reversed: newest first → row "3" is newest (last in chronological) → first in history
    expect(stats.history[0].id).toBe("3");
  });

  it("returns zero stats when DB has no rows", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      order:  jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const stats = await getStats();

    expect(stats.totalAnalyses).toBe(0);
    expect(stats.totalWasteAllTime).toBe(0);
    expect(stats.avgScore).toBe(0);
    expect(stats.locations).toHaveLength(0);
    expect(stats.history).toHaveLength(0);
  });

  it("throws when Supabase returns an error", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      order:  jest.fn().mockResolvedValue({ data: null, error: new Error("DB error") }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(getStats()).rejects.toThrow("DB error");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deleteAnalysisForUser", () => {
  it("throws 'Not found or not yours' when analysis does not exist", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq:     jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error("not found") }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(deleteAnalysisForUser("id-1", "user-abc")).rejects.toThrow(
      "Not found or not yours"
    );
  });

  it("throws 'Not found or not yours' when analysis belongs to a different user", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq:     jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "id-1", image_url: "https://example.com/img.jpg", user_id: "other-user" },
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(deleteAnalysisForUser("id-1", "user-abc")).rejects.toThrow(
      "Not found or not yours"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("listAnalyses", () => {
  it("throws when Supabase returns an error", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      order:  jest.fn().mockReturnThis(),
      range:  jest.fn().mockResolvedValue({ data: null, error: new Error("connection failed") }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(listAnalyses()).rejects.toThrow("connection failed");
  });

  it("returns data array on success", async () => {
    const fakeData = [{ id: "a1" }, { id: "a2" }];
    const chain = {
      select: jest.fn().mockReturnThis(),
      order:  jest.fn().mockReturnThis(),
      range:  jest.fn().mockResolvedValue({ data: fakeData, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const result = await listAnalyses({ limit: 10, offset: 0 });
    expect(result).toEqual(fakeData);
  });
});
