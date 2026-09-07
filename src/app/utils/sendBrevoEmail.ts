import httpStatus from "http-status";
import AppError from "../error/AppError";

interface IBrevoEmailOptions {
  toEmail: string;
  toName?: string;
  templateId: number;
  subject?: string;
  params?: Record<string, any>;
}

export const sendBrevoEmail = async ({
  toEmail,
  toName = "",
  templateId,
  subject,
  params = {},
}: IBrevoEmailOptions) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;

  if (!apiKey) {
    console.warn("[Brevo Email] Warning: BREVO_API_KEY or SMTP_PASS is not configured in .env");
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Email service not configured. BREVO_API_KEY is missing in .env."
    );
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM_EMAIL || "contact@sabledreams.com";
  const senderName = process.env.BREVO_SENDER_NAME || process.env.SMTP_FROM_NAME || "Sable Dreams";

  try {
    const payload: any = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail,
        },
      ],
      templateId,
      params,
    };

    if (subject) {
      payload.subject = subject;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error("[Brevo Email Error API]:", data);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Brevo API error: ${data?.message || response.statusText}`
      );
    }

    console.log(`[Brevo Email] Successfully sent templateId ${templateId} to ${toEmail}. MessageID:`, data?.messageId);
    return data;
  } catch (error: any) {
    console.error("[Brevo Email Error]:", error.message || error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to send email via Brevo: ${error.message || error}`
    );
  }
};

export default sendBrevoEmail;
