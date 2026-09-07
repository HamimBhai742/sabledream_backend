import sendEmail from "../sendEmail";
import { sendBrevoEmail } from "../sendBrevoEmail";

interface SubscriptionEndedData {
  userName: string;
  email: string;
  planName?: string;
}

export const subscriptionEndedTemplate = async (
  data: SubscriptionEndedData,
) => {
  const { userName, email, planName } = data;

  if (process.env.BREVO_API_KEY || process.env.SMTP_PASS) {
    try {
      await sendBrevoEmail({
        toEmail: email,
        toName: userName,
        templateId: 10, // Brevo Template #10: Subscription ended
        params: {
          NAME: userName,
          userName,
          planName: planName || "Sable Dreams Subscription",
        },
      });
      return;
    } catch (brevoErr) {
      console.warn(
        "[Email] Brevo API failed for subscriptionEnded, falling back to SMTP:",
        brevoErr,
      );
    }
  }

  const subject = "🥀 Your Sable Dreams Subscription Has Ended";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Subscription Ended</title>
</head>
<body style="font-family: Georgia, serif; padding: 20px; color: #333;">
  <h2>Hello, ${userName || "Sable Dreamer"}</h2>
  <p>Your subscription (${planName || "Sable Dreams"}) has now ended.</p>
  <p>You can resubscribe anytime from the Sable Dreams app to restore full access. 💕</p>
</body>
</html>
  `;

  await sendEmail(email, subject, html);
};
