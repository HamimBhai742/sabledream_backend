import nodemailer from "nodemailer";
import httpStatus from "http-status";
import AppError from "../error/AppError";

const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  try {
    const port = Number(process.env.SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port,
      // Port 465 = SSL (secure: true), Port 587 = STARTTLS (secure: false)
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Sable Dreams"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send email. Please try again later."
    );
  }
};

export default sendEmail;

