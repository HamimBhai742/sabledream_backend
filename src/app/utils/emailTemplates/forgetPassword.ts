import sendEmail from "../sendEmail";

interface ForgotPasswordData {
  userName: string;
  email: string;
  otp: string;
  requestedAt: string;
}

export const forgotPasswordTemplate = async (data: ForgotPasswordData) => {
  const { userName, email, otp, requestedAt } = data;

  const subject = "🌸 Reset Your Password";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password OTP</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #fdf0f4;
  font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdf0f4; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="
          max-width: 600px;
          width: 100%;
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(210,80,120,0.12), 0 4px 16px rgba(0,0,0,0.04);
          border: 1px solid rgba(255,182,207,0.4);
        ">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="
              background: linear-gradient(160deg, #fce4ec 0%, #f8bbd0 40%, #f48fb1 100%);
              padding: 48px 48px 40px;
              text-align: center;
            ">
              <!-- Logo -->
              <img
                src="https://imglink.cc/cdn/vnw0bUtBsF.png"
                height="44"
                alt="Logo"
                style="display: block; margin: 0 auto 22px;"
              />

              <!-- Lock icon circle -->
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.6);
                border: 2px solid rgba(255,255,255,0.9);
                border-radius: 50%;
                width: 72px;
                height: 72px;
                line-height: 72px;
                text-align: center;
                font-size: 30px;
                margin-bottom: 20px;
                box-shadow: 0 4px 20px rgba(233,30,99,0.2);
              ">🔑</div>

              <h1 style="
                margin: 0 0 8px;
                color: #880e4f;
                font-size: 28px;
                font-weight: 400;
                font-style: italic;
                font-family: Georgia, 'Times New Roman', serif;
                letter-spacing: 0.3px;
              ">Reset Your Password</h1>

              <p style="
                margin: 0;
                color: rgba(136,14,79,0.6);
                font-size: 11.5px;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-weight: 500;
              ">Your one-time verification code ✦</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding: 44px 48px 36px; background: #ffffff;">

              <!-- Greeting -->
              <p style="
                margin: 0 0 14px;
                font-size: 20px;
                color: #3d0020;
                font-family: Georgia, 'Times New Roman', serif;
                font-weight: 400;
              ">Hey, ${userName}! 🌸</p>

              <p style="margin: 0 0 34px; font-size: 14px; color: #8c5c6b; line-height: 1.85;">
                No worries — it happens to the best of us. We received a request to reset
                your password. Please use the following One-Time Password (OTP) to reset
                your password in the app:<br/><br/>
                This OTP is valid for <strong style="color: #c2185b;">15 minutes</strong>,
                so be sure to use it soon.
              </p>

              <!-- Expiry pill -->
              <p style="text-align: center; margin: 0 0 28px;">
                <span style="
                  display: inline-block;
                  background: #fce4ec;
                  border: 1px solid rgba(233,30,99,0.2);
                  color: #c2185b;
                  font-size: 12px;
                  font-weight: 500;
                  padding: 6px 16px;
                  border-radius: 50px;
                  letter-spacing: 0.3px;
                ">⏱ Expires in 15 minutes</span>
              </p>

              <!-- ===== OTP CODE DISPLAY ===== -->
              <div style="text-align: center; margin: 0 0 30px;">
                <div style="
                  display: inline-block;
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 38px;
                  font-weight: bold;
                  letter-spacing: 6px;
                  color: #c2185b;
                  background-color: #fce4ec;
                  padding: 18px 36px;
                  border-radius: 16px;
                  border: 2px dashed rgba(233,30,99,0.3);
                  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                ">
                  ${otp}
                </div>
              </div>

              <!-- ===== DIVIDER ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
                <tr>
                  <td style="border-top: 1px solid rgba(233,30,99,0.15);"></td>
                  <td style="padding: 0 14px; font-size: 16px; color: #f48fb1; white-space: nowrap;">🌷</td>
                  <td style="border-top: 1px solid rgba(233,30,99,0.15);"></td>
                </tr>
              </table>

              <!-- Requested at note -->
              <p style="
                margin: 0 0 24px;
                font-size: 12px;
                color: #c4a0b0;
                text-align: center;
              ">Requested at: ${requestedAt}</p>

              <!-- ===== SAFETY NOTE ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #fffbf0;
                border: 1px solid rgba(255,193,7,0.3);
                border-radius: 12px;
              ">
                <tr>
                  <td style="padding: 14px 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 15px;">🔒</td>
                        <td style="padding-left: 10px; font-size: 12.5px; color: #997755; line-height: 1.65;">
                          <strong style="color: #7a5500;">Didn't ask for this?</strong>
                          You can safely ignore this email. Your password will stay the same
                          and this code will expire on its own.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="
              background: #fdf0f4;
              border-top: 1px solid rgba(233,30,99,0.08);
              padding: 26px 48px;
              text-align: center;
            ">
              <p style="margin: 0 0 8px; font-size: 11px; color: #f4a7be; letter-spacing: 6px;">♡ ♡ ♡</p>

              <img
                src="https://imglink.cc/cdn/vnw0bUtBsF.png"
                height="24"
                alt="Logo"
                style="display: block; margin: 0 auto 14px; opacity: 0.5;"
              />

              <p style="margin: 0 0 10px; font-size: 12px; color: #c48098; line-height: 1.7;">
                You're receiving this because a password reset was requested for your account.<br/>
                Questions? <a href="#" style="color: #e91e63; text-decoration: none;">Contact our support team</a>
                — we're always here for you.
              </p>

              <p style="margin: 0 0 12px; font-size: 12px; color: #c48098;">
                <a href="#" style="color: #e91e63; text-decoration: none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #e91e63; text-decoration: none;">Terms of Service</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #e91e63; text-decoration: none;">Unsubscribe</a>
              </p>

              <p style="margin: 0; font-size: 11px; color: #dda8b8; line-height: 1.6;">
                This email was sent to <strong>${email}</strong> because a password reset was
                requested for your account.<br/>
                If this wasn't you, no action is needed — your password has not been changed.<br/>
                © ${new Date().getFullYear()} Your Company. Made with 🌸 for you.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  await sendEmail(email, subject, html);
};