import sendEmail from "../sendEmail";
import { sendBrevoEmail } from "../sendBrevoEmail";

interface SubscriptionCanceledData {
  userName: string;
  email: string;
  planName?: string;
  expiresAt?: string;
}

export const subscriptionCanceledTemplate = async (
  data: SubscriptionCanceledData,
) => {
  const { userName, email, planName, expiresAt } = data;

  if (process.env.BREVO_API_KEY || process.env.SMTP_PASS) {
    try {
      await sendBrevoEmail({
        toEmail: email,
        toName: userName,
        templateId: 9, // Brevo Template #9: Subscription canceled
        params: {
          NAME: userName,
          userName,
          planName: planName || "Sable Dreams Subscription",
          expiresAt: expiresAt || "End of billing period",
        },
      });
      return;
    } catch (brevoErr) {
      console.warn(
        "[Email] Brevo API failed for subscriptionCanceled, falling back to SMTP:",
        brevoErr,
      );
    }
  }

  const subject = "💔 Your Sable Dreams Subscription Has Been Canceled";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Subscription Canceled</title>
</head>
<body style="font-family: Georgia, serif; padding: 20px; color: #333;">
  <h2>Hello, ${userName || "Sable Dreamer"}</h2>
  <p>Your subscription (${planName || "Sable Dreams"}) has been canceled.</p>
  <p>You will continue to have access until <strong>${expiresAt || "the end of your billing cycle"}</strong>.</p>
  <p>Thank you for being part of Sable Dreams 💕</p>
</body>
</html>
  `;

  await sendEmail(email, subject, html);
};
