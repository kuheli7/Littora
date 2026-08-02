/**
 * Tests for middleware/auth.js
 * requireAuth — verifies Bearer JWT, attaches req.user
 * requireAdmin — checks ADMIN_EMAIL env var
 */
import { jest } from "@jest/globals";

// ── Mock supabaseClient before import ───────────────────────────────────────
const mockGetUser = jest.fn();
jest.unstable_mockModule("../services/supabaseClient.js", () => ({
  supabase: { auth: { getUser: mockGetUser } },
}));

const { requireAuth, requireAdmin } = await import("../middleware/auth.js");

// Helpers
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
describe("requireAuth middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when Authorization header is absent", async () => {
    const req  = { headers: {} };
    const res  = makeRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when header does not start with 'Bearer '", async () => {
    const req  = { headers: { authorization: "Token abc123" } };
    const res  = makeRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Supabase returns an error", async () => {
    mockGetUser.mockResolvedValueOnce({ data: null, error: new Error("invalid jwt") });

    const req  = { headers: { authorization: "Bearer bad-token" } };
    const res  = makeRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Supabase returns no user", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req  = { headers: { authorization: "Bearer token-with-no-user" } };
    const res  = makeRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches req.user and calls next() for a valid token", async () => {
    const fakeUser = { id: "user-123", email: "user@test.com" };
    mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser }, error: null });

    const req  = { headers: { authorization: "Bearer valid-token" } };
    const res  = makeRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("requireAdmin middleware", () => {
  it("returns 403 when user email does not match ADMIN_EMAIL", () => {
    const req  = { user: { email: "regular@test.com" } };
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when req.user is missing", () => {
    const req  = {};
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when user email matches ADMIN_EMAIL", () => {
    const req  = { user: { email: "admin@littora.app" } };
    const res  = makeRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
