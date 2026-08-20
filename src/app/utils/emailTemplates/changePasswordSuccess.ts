import sendEmail from "../sendEmail";

interface ChangePasswordSuccessData {
  userName: string;
  email: string;
  changedAt: string;
  ipAddress?: string;
  device?: string;
}

export const changePasswordSuccessTemplate = async (
  data: ChangePasswordSuccessData,
) => {
  const { userName, email, changedAt, ipAddress, device } = data;

  const subject = "🔐 Your Password Has Been Changed Successfully";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Changed Successfully</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f0f4fd;
  font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f4fd; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="
          max-width: 600px;
          width: 100%;
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(63,97,210,0.12), 0 4px 16px rgba(0,0,0,0.04);
          border: 1px solid rgba(182,198,255,0.4);
        ">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="
              background: linear-gradient(160deg, #e8eeff 0%, #c5d1fb 40%, #9baef7 100%);
              padding: 48px 48px 40px;
              text-align: center;
            ">
              <!-- Logo -->
              <img
                src="https://imglink.cc/cdn/K5i74ZtPzJ.png"
                height="44"
                alt="Logo"
                style="display: block; margin: 0 auto 22px;"
              />

              <!-- Shield icon circle -->
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.6);
                border: 2px solid rgba(255,255,255,0.9);
                border-radius: 50%;
                width: 72px;
                height: 72px;
                line-height: 72px;
                text-align: center;
                font-size: 32px;
                margin-bottom: 20px;
                box-shadow: 0 4px 20px rgba(63,97,210,0.2);
              ">🔐</div>

              <h1 style="
                margin: 0 0 8px;
                color: #1a237e;
                font-size: 28px;
                font-weight: 400;
                font-style: italic;
                font-family: Georgia, 'Times New Roman', serif;
                letter-spacing: 0.3px;
              ">Password Changed Successfully!</h1>

              <p style="
                margin: 0;
                color: rgba(26,35,126,0.6);
                font-size: 11.5px;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-weight: 500;
              ">Your account is secure ✦</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding: 44px 48px 36px; background: #ffffff;">

              <!-- Greeting -->
              <p style="
                margin: 0 0 14px;
                font-size: 20px;
                color: #0d1440;
                font-family: Georgia, 'Times New Roman', serif;
                font-weight: 400;
              ">Hi, ${userName}! 🛡️</p>

              <p style="margin: 0 0 32px; font-size: 14px; color: #5c6899; line-height: 1.85;">
                This is a confirmation that your account password has been changed
                successfully. Your account remains fully protected. If this change
                was made by you, no further action is needed. 💙
              </p>

              <!-- ===== CHANGE DETAILS BOX ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: linear-gradient(135deg, #f0f4fd 0%, #e8eeff 100%);
                border: 1px solid rgba(63,97,210,0.2);
                border-radius: 14px;
                margin-bottom: 10px;
              ">
                <tr>
                  <td style="padding: 28px 24px; text-align: center;">

                    <p style="
                      margin: 0 0 16px;
                      font-size: 12px;
                      color: #3f61d2;
                      text-transform: uppercase;
                      letter-spacing: 1.5px;
                      font-weight: 700;
                    ">✦ Change Details</p>

                    <!-- Details rows -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; width: 100%; max-width: 340px;">

                      <!-- Row: Status -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 10px 10px 0 0;
                          border: 1px solid rgba(63,97,210,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          color: #5c6899;
                        ">Password Status</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 10px 10px 0 0;
                          border: 1px solid rgba(63,97,210,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 600;
                          color: #2e7d32;
                          text-align: right;
                        ">✅ Updated</td>
                      </tr>

                      <!-- Row: Account -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #f7f9ff;
                          border: 1px solid rgba(63,97,210,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          color: #5c6899;
                        ">Account</td>
                        <td style="
                          padding: 10px 16px;
                          background: #f7f9ff;
                          border: 1px solid rgba(63,97,210,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 600;
                          color: #0d1440;
                          text-align: right;
                        ">🔒 Secured</td>
                      </tr>

                      <!-- Row: Changed At -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border: 1px solid rgba(63,97,210,0.12);
                          ${ipAddress || device ? "border-bottom: none;" : "border-radius: 0 0 0 10px;"}
                          font-size: 13px;
                          color: #5c6899;
                        ">Changed At</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border: 1px solid rgba(63,97,210,0.12);
                          ${ipAddress || device ? "border-bottom: none;" : "border-radius: 0 0 10px 0;"}
                          font-size: 13px;
                          font-weight: 500;
                          color: #0d1440;
                          text-align: right;
                        ">${changedAt}</td>
                      </tr>

                      ${ipAddress ? `
                      <!-- Row: IP Address -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #f7f9ff;
                          border: 1px solid rgba(63,97,210,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          color: #5c6899;
                        ">IP Address</td>
                        <td style="
                          padding: 10px 16px;
                          background: #f7f9ff;
                          border: 1px solid rgba(63,97,210,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 500;
                          color: #0d1440;
                          text-align: right;
                        ">${ipAddress}</td>
                      </tr>
                      ` : ""}

                      ${device ? `
                      <!-- Row: Device -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 0 0 0 10px;
                          border: 1px solid rgba(63,97,210,0.12);
                          font-size: 13px;
                          color: #5c6899;
                        ">Device</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 0 0 10px 0;
                          border: 1px solid rgba(63,97,210,0.12);
                          font-size: 13px;
                          font-weight: 500;
                          color: #0d1440;
                          text-align: right;
                        ">${device}</td>
                      </tr>
                      ` : ""}

                    </table>

                  </td>
                </tr>
              </table>

              <!-- Email note -->
              <p style="
                margin: 0 0 32px;
                font-size: 12px;
                color: #9eaad4;
                text-align: center;
              ">Changes applied to: <strong style="color: #3f61d2;">${email}</strong></p>

              <!-- ===== DIVIDER ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px;">
                <tr>
                  <td style="border-top: 1px solid rgba(63,97,210,0.15);"></td>
                  <td style="padding: 0 14px; font-size: 16px; color: #9baef7; white-space: nowrap;">🔷</td>
                  <td style="border-top: 1px solid rgba(63,97,210,0.15);"></td>
                </tr>
              </table>

              <!-- ===== SECURITY TIPS ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #f8f9fc;
                border: 1px solid rgba(63,97,210,0.1);
                border-radius: 14px;
                margin-bottom: 24px;
              ">
                <tr>
                  <td style="padding: 20px 22px;">
                    <p style="
                      margin: 0 0 14px;
                      font-size: 12px;
                      color: #3f61d2;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      font-weight: 700;
                    ">🔒 Keep Your Account Safe</p>

                    <!-- Tip 1 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">✨</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #5c6899; line-height: 1.6;">
                          Make sure your new password is <strong style="color: #0d1440;">unique</strong> and not reused from any other site.
                        </td>
                      </tr>
                    </table>

                    <!-- Tip 2 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">🚫</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #5c6899; line-height: 1.6;">
                          <strong style="color: #0d1440;">Never share</strong> your password with anyone, including our support team.
                        </td>
                      </tr>
                    </table>

                    <!-- Tip 3 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">🔔</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #5c6899; line-height: 1.6;">
                          Consider enabling <strong style="color: #0d1440;">two-factor authentication</strong> for an extra layer of security.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ===== WARNING — WASN'T YOU ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #fff5f7;
                border: 1px solid rgba(233,30,99,0.2);
                border-left: 4px solid #e91e63;
                border-radius: 10px;
              ">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #880e4f; text-transform: uppercase; letter-spacing: 0.8px;">⚠️ Wasn't You?</p>
                    <p style="margin: 0; font-size: 13.5px; color: #8c5c6b; line-height: 1.6;">
                      If you did not make this change, your account may be compromised.
                      Please <a href="#" style="color: #e91e63; font-weight: 600; text-decoration: none;">contact our support team</a> immediately so we can secure your account and investigate.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="
              background: #f0f4fd;
              border-top: 1px solid rgba(63,97,210,0.08);
              padding: 26px 48px;
              text-align: center;
            ">
              <p style="margin: 0 0 8px; font-size: 11px; color: #9baef7; letter-spacing: 6px;">♡ ♡ ♡</p>

              <img
                src="https://imglink.cc/cdn/K5i74ZtPzJ.png"
                height="24"
                alt="Logo"
                style="display: block; margin: 0 auto 14px; opacity: 0.5;"
              />

              <p style="margin: 0 0 10px; font-size: 12px; color: #8090c4; line-height: 1.7;">
                You're receiving this because your account password was recently changed.<br/>
                Questions? <a href="#" style="color: #3f61d2; text-decoration: none;">Contact our support team</a>
                — we're always here for you.
              </p>

              <p style="margin: 0 0 12px; font-size: 12px; color: #8090c4;">
                <a href="#" style="color: #3f61d2; text-decoration: none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #3f61d2; text-decoration: none;">Terms of Service</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #3f61d2; text-decoration: none;">Unsubscribe</a>
              </p>

              <p style="margin: 0; font-size: 11px; color: #b0bde8; line-height: 1.6;">
                This email was sent to <strong>${email}</strong> as a confirmation of your recent password change.<br/>
                If this wasn't you, please contact support immediately.<br/>
                © ${new Date().getFullYear()} Your Company. Made with 💙 for you.
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