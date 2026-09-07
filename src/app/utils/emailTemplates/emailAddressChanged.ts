import sendEmail from "../sendEmail";
import { sendBrevoEmail } from "../sendBrevoEmail";

interface EmailAddressChangedData {
  userName: string;
  email: string;
  newEmail?: string;
}

export const emailAddressChangedTemplate = async (
  data: EmailAddressChangedData,
) => {
  const { userName, email, newEmail } = data;

  if (process.env.BREVO_API_KEY || process.env.SMTP_PASS) {
    try {
      await sendBrevoEmail({
        toEmail: email,
        toName: userName,
        templateId: 16, // Brevo Template #16: Email address changed
        params: {
          NAME: userName,
          userName,
          newEmail: newEmail || email,
        },
      });
      return;
    } catch (brevoErr) {
      console.warn(
        "[Email] Brevo API failed for emailAddressChanged, falling back to SMTP:",
        brevoErr,
      );
    }
  }

  const subject = "🔒 Notice: Your Sable Dreams Email Address Was Changed";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Email Address Changed</title>
</head>
<body style="font-family: Georgia, serif; padding: 20px; color: #333;">
  <h2>Hello, ${userName || "Sable Dreamer"}</h2>
  <p>The email address associated with your Sable Dreams account was recently updated.</p>
  <p>If you did not request this change, please contact support immediately at <a href="mailto:sdsupport@sabledreams.com">sdsupport@sabledreams.com</a>.</p>
</body>
</html>
  `;

  await sendEmail(email, subject, html);
};
