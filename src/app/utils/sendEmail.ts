import httpStatus from "http-status";
import AppError from "../error/AppError";

const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.SMTP_FROM_EMAIL || "9d9583001@smtp-brevo.com";
  const fromName = process.env.SMTP_FROM_NAME || "Sable Dreams";

  if (!apiKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Email service not configured. BREVO_API_KEY is missing."
    );
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as any;
      const errorMessage = errorBody?.message || response.statusText;
      console.error("[Email] Brevo API error:", errorMessage);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to send email: ${errorMessage}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    console.error("[Email] Unexpected error sending email:", error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send email. Please try again later."
    );
  }
};

export default sendEmail;

