import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { sendEmail } from "../services/emailService.js";

const router = Router();

router.post("/send-report", requireAuth, async (req, res) => {
  const { reportType, reportText } = req.body;
  const recipient = req.user.email;

  if (!recipient) {
    return res.status(400).json({ error: "User email not found" });
  }

  try {
    await sendEmail({
      to: recipient,
      subject: `Littora Beach Waste Report (${reportType.toUpperCase()})`,
      text: reportText || "Your Littora beach waste report is ready.",
    });
    res.json({ message: "Report sent to email successfully", recipient });
  } catch (err) {
    console.error("Email delivery failed:", err.message);
    res.status(500).json({ error: "Could not send report email", details: err.message });
  }
});

export default router;
