import nodemailer from "nodemailer";
import httpStatus from "http-status";
import AppError from "../error/AppError";

const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || "contact@sabledreams.com";
  const fromName = process.env.SMTP_FROM_NAME || "Sable Dreams";

  if (!smtpUser || !smtpPass) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Email service not configured. SMTP_USER and SMTP_PASS are missing."
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });

    return info;
  } catch (error: any) {
    console.error("[Email] Nodemailer transport error:", error.message || error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to send email: ${error.message || error}`
    );
  }
};

export default sendEmail;

