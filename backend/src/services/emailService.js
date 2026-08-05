import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Littora Systems" <noreply@littora.app>`;

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return await transporter.sendMail({ from, to, subject, text, html });
  } else {
    console.log("[EmailService Simulated Mode] Email payload:", { to, subject, text });
    return { messageId: `simulated-${Date.now()}` };
  }
}
