import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";

const mockGetUser = jest.fn();
const mockSendEmail = jest.fn();

jest.unstable_mockModule("../services/supabaseClient.js", () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
  },
}));

jest.unstable_mockModule("../services/emailService.js", () => ({
  sendEmail: mockSendEmail,
}));

const { default: emailRouter } = await import("../routes/email.js");

const app = express();
app.use(express.json());
app.use("/api/email", emailRouter);

describe("POST /api/email/send-report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 Unauthorized if authorization header is missing", async () => {
    const res = await request(app)
      .post("/api/email/send-report")
      .send({ reportType: "pdf", reportText: "Test report body" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authentication required/i);
  });

  it("returns 400 Bad Request if user email is missing from token payload", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-no-email", email: null } }, error: null });

    const res = await request(app)
      .post("/api/email/send-report")
      .set("Authorization", "Bearer valid-token-no-email")
      .send({ reportType: "pdf", reportText: "Test report body" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("User email not found");
  });

  it("successfully delivers report email and returns 200 OK", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-123", email: "user@example.com" } }, error: null });
    mockSendEmail.mockResolvedValueOnce({ messageId: "msg-999" });

    const res = await request(app)
      .post("/api/email/send-report")
      .set("Authorization", "Bearer valid-token")
      .send({ reportType: "pdf", reportText: "Weekly analysis report details" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Report sent to email successfully");
    expect(res.body.recipient).toBe("user@example.com");
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Littora Beach Waste Report (PDF)",
      text: "Weekly analysis report details",
    });
  });

  it("handles sendEmail exceptions and returns 500 error", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-123", email: "user@example.com" } }, error: null });
    mockSendEmail.mockRejectedValueOnce(new Error("SMTP Connection Failed"));

    const res = await request(app)
      .post("/api/email/send-report")
      .set("Authorization", "Bearer valid-token")
      .send({ reportType: "csv" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Could not send report email");
    expect(res.body.details).toBe("SMTP Connection Failed");
  });
});
