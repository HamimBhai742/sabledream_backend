import sendEmail from "../sendEmail";
import { sendBrevoEmail } from "../sendBrevoEmail";

interface VerifyEmailData {
  userName: string;
  email: string;
  otp: string;
}

export const verifyEmailTemplate = async (data: VerifyEmailData) => {
  const { userName, email, otp } = data;

  if (process.env.BREVO_API_KEY || process.env.SMTP_PASS) {
    try {
      await sendBrevoEmail({
        toEmail: email,
        toName: userName,
        templateId: 13, // Brevo Template #13: Verify email
        params: {
          OTP: otp,
          otp,
          NAME: userName,
          userName,
        },
      });
      return;
    } catch (brevoErr) {
      console.warn(
        "[Email] Brevo API failed for verifyEmail, falling back to SMTP:",
        brevoErr,
      );
    }
  }

  const subject = "🌸 Verify Your Email — Sable Dreams";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Verify Email</title>
</head>
<body style="font-family: Georgia, serif; padding: 20px; color: #333;">
  <h2>Hello, ${userName || "Sable Dreamer"}</h2>
  <p>Your verification code is: <strong style="font-size: 20px; color: #c05880;">${otp}</strong></p>
  <p>Please enter this code in the Sable Dreams app to verify your email address.</p>
</body>
</html>
  `;

  await sendEmail(email, subject, html);
};
