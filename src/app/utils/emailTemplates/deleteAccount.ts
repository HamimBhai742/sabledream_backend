import sendEmail from "../sendEmail";

interface DeleteAccountPermanentData {
  userName: string;
  email: string;
  deletedAt: string;
  ipAddress?: string;
  device?: string;
}

export const deleteAccountPermanentTemplate = async (
  data: DeleteAccountPermanentData,
) => {
  const { userName, email, deletedAt, ipAddress, device } = data;

  const subject = "🖤 Your Account Has Been Permanently Deleted";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Permanently Deleted</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
  font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f0f0; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="
          max-width: 600px;
          width: 100%;
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.08);
        ">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="
              background: linear-gradient(160deg, #2c2c2c 0%, #1a1a1a 50%, #0d0d0d 100%);
              padding: 48px 48px 40px;
              text-align: center;
            ">
              <!-- Logo -->
              <img
                src="https://imglink.cc/cdn/K5i74ZtPzJ.png"
                height="44"
                alt="Logo"
                style="display: block; margin: 0 auto 22px; filter: brightness(0) invert(1); opacity: 0.85;"
              />

              <!-- Permanent icon circle -->
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.07);
                border: 2px solid rgba(255,255,255,0.15);
                border-radius: 50%;
                width: 72px;
                height: 72px;
                line-height: 72px;
                text-align: center;
                font-size: 32px;
                margin-bottom: 20px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.4);
              ">🖤</div>

              <h1 style="
                margin: 0 0 8px;
                color: #f5f5f5;
                font-size: 28px;
                font-weight: 400;
                font-style: italic;
                font-family: Georgia, 'Times New Roman', serif;
                letter-spacing: 0.3px;
              ">Account Permanently Deleted</h1>

              <p style="
                margin: 0;
                color: rgba(255,255,255,0.35);
                font-size: 11.5px;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-weight: 500;
              ">This action cannot be undone ✦</p>
            </td>
          </tr>

          <!-- ===== RED ALERT BANNER ===== -->
          <tr>
            <td style="
              background: linear-gradient(90deg, #b71c1c 0%, #c62828 100%);
              padding: 13px 48px;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                color: #ffcdd2;
                letter-spacing: 1.8px;
                text-transform: uppercase;
                font-weight: 700;
              ">⛔ All data has been permanently erased — no recovery possible</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding: 44px 48px 36px; background: #ffffff;">

              <!-- Greeting -->
              <p style="
                margin: 0 0 14px;
                font-size: 20px;
                color: #111111;
                font-family: Georgia, 'Times New Roman', serif;
                font-weight: 400;
              ">Farewell, ${userName}.</p>

              <p style="margin: 0 0 32px; font-size: 14px; color: #555555; line-height: 1.85;">
                Your account has been <strong style="color: #111;">permanently and irreversibly deleted</strong>.
                All associated data — including your profile, history, preferences, and any stored content —
                has been erased from our systems with no possibility of recovery.
                We're grateful for the time you spent with us.
              </p>

              <!-- ===== DELETION DETAILS BOX ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #f7f7f7;
                border: 1px solid #e0e0e0;
                border-radius: 14px;
                margin-bottom: 10px;
              ">
                <tr>
                  <td style="padding: 28px 24px; text-align: center;">

                    <p style="
                      margin: 0 0 16px;
                      font-size: 12px;
                      color: #333333;
                      text-transform: uppercase;
                      letter-spacing: 1.5px;
                      font-weight: 700;
                    ">✦ Deletion Record</p>

                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; width: 100%; max-width: 340px;">

                      <!-- Row: Status -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 10px 10px 0 0;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          color: #666666;
                        ">Account Status</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 10px 10px 0 0;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 700;
                          color: #b71c1c;
                          text-align: right;
                        ">⛔ Permanently Deleted</td>
                      </tr>

                      <!-- Row: Recovery -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #fafafa;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          color: #666666;
                        ">Recovery</td>
                        <td style="
                          padding: 10px 16px;
                          background: #fafafa;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 600;
                          color: #b71c1c;
                          text-align: right;
                        ">✗ Not possible</td>
                      </tr>

                      <!-- Row: Deleted At -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          color: #666666;
                        ">Deleted At</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 500;
                          color: #111111;
                          text-align: right;
                        ">${deletedAt}</td>
                      </tr>

                      <!-- Row: Data Purge -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #fafafa;
                          border: 1px solid #e8e8e8;
                          ${ipAddress || device ? "border-bottom: none;" : "border-radius: 0 0 0 10px;"}
                          font-size: 13px;
                          color: #666666;
                        ">Data Purge</td>
                        <td style="
                          padding: 10px 16px;
                          background: #fafafa;
                          border: 1px solid #e8e8e8;
                          ${ipAddress || device ? "border-bottom: none;" : "border-radius: 0 0 10px 0;"}
                          font-size: 13px;
                          font-weight: 600;
                          color: #111111;
                          text-align: right;
                        ">✅ Immediately purged</td>
                      </tr>

                      ${ipAddress ? `
                      <!-- Row: IP Address -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          color: #666666;
                        ">IP Address</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border: 1px solid #e8e8e8;
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 500;
                          color: #111111;
                          text-align: right;
                        ">${ipAddress}</td>
                      </tr>
                      ` : ""}

                      ${device ? `
                      <!-- Row: Device -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #fafafa;
                          border-radius: 0 0 0 10px;
                          border: 1px solid #e8e8e8;
                          font-size: 13px;
                          color: #666666;
                        ">Device</td>
                        <td style="
                          padding: 10px 16px;
                          background: #fafafa;
                          border-radius: 0 0 10px 0;
                          border: 1px solid #e8e8e8;
                          font-size: 13px;
                          font-weight: 500;
                          color: #111111;
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
                color: #aaaaaa;
                text-align: center;
              ">Account associated with: <strong style="color: #333333;">${email}</strong></p>

              <!-- ===== DIVIDER ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px;">
                <tr>
                  <td style="border-top: 1px solid #e0e0e0;"></td>
                  <td style="padding: 0 14px; font-size: 16px; color: #aaaaaa; white-space: nowrap;">◆</td>
                  <td style="border-top: 1px solid #e0e0e0;"></td>
                </tr>
              </table>

              <!-- ===== WHAT WAS DELETED ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #f7f7f7;
                border: 1px solid #e0e0e0;
                border-radius: 14px;
                margin-bottom: 24px;
              ">
                <tr>
                  <td style="padding: 20px 22px;">
                    <p style="
                      margin: 0 0 14px;
                      font-size: 12px;
                      color: #333333;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      font-weight: 700;
                    ">🗑️ What Was Erased</p>

                    <!-- Item 1 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">👤</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #555555; line-height: 1.6;">
                          Your <strong style="color: #111111;">profile, name, and personal information</strong> have been permanently removed.
                        </td>
                      </tr>
                    </table>

                    <!-- Item 2 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">📁</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #555555; line-height: 1.6;">
                          All <strong style="color: #111111;">content, history, and stored data</strong> linked to your account has been wiped.
                        </td>
                      </tr>
                    </table>

                    <!-- Item 3 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 10px;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">🔑</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #555555; line-height: 1.6;">
                          Your <strong style="color: #111111;">login credentials and active sessions</strong> have been invalidated across all devices.
                        </td>
                      </tr>
                    </table>

                    <!-- Item 4 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="width: 22px; vertical-align: top; padding-top: 1px; font-size: 14px;">💳</td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #555555; line-height: 1.6;">
                          Any <strong style="color: #111111;">billing information and subscription data</strong> has been securely deleted per our Privacy Policy.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ===== START FRESH ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #1a1a1a;
                border-radius: 14px;
                margin-bottom: 24px;
              ">
                <tr>
                  <td style="padding: 24px 28px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 15px; color: #f5f5f5; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-style: italic;">
                      Every ending is a new beginning.
                    </p>
                    <p style="margin: 0 0 18px; font-size: 13.5px; color: #999999; line-height: 1.7;">
                      If you ever wish to start fresh, you're always welcome<br/>
                      to create a brand new account with us.
                    </p>
                    <a href="#" style="
                      display: inline-block;
                      background: #ffffff;
                      color: #111111;
                      text-decoration: none;
                      font-size: 13.5px;
                      font-weight: 700;
                      padding: 12px 32px;
                      border-radius: 50px;
                      letter-spacing: 0.4px;
                      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
                    ">Start Fresh — Create New Account</a>
                  </td>
                </tr>
              </table>

              <!-- ===== WARNING — WASN'T YOU ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #fff5f5;
                border: 1px solid rgba(183,28,28,0.25);
                border-left: 4px solid #b71c1c;
                border-radius: 10px;
              ">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #7f0000; text-transform: uppercase; letter-spacing: 0.8px;">⚠️ Wasn't You?</p>
                    <p style="margin: 0; font-size: 13.5px; color: #7a4040; line-height: 1.6;">
                      If you did not request this deletion, your account has been compromised and all data is already lost.
                      Please <a href="#" style="color: #b71c1c; font-weight: 600; text-decoration: none;">contact our support team</a> immediately so we can investigate and secure any remaining systems.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="
              background: #f0f0f0;
              border-top: 1px solid #e0e0e0;
              padding: 26px 48px;
              text-align: center;
            ">
              <p style="margin: 0 0 8px; font-size: 11px; color: #bbbbbb; letter-spacing: 6px;">· · ·</p>

              <img
                src="https://imglink.cc/cdn/K5i74ZtPzJ.png"
                height="24"
                alt="Logo"
                style="display: block; margin: 0 auto 14px; opacity: 0.25; filter: grayscale(100%);"
              />

              <p style="margin: 0 0 10px; font-size: 12px; color: #888888; line-height: 1.7;">
                You're receiving this as a final confirmation of your permanent account deletion.<br/>
                Questions? <a href="#" style="color: #444444; text-decoration: none;">Contact our support team</a>
                — we're always here for you.
              </p>

              <p style="margin: 0 0 12px; font-size: 12px; color: #888888;">
                <a href="#" style="color: #444444; text-decoration: none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #444444; text-decoration: none;">Terms of Service</a>
                &nbsp;·&nbsp;
                <a href="#" style="color: #444444; text-decoration: none;">Data Retention Policy</a>
              </p>

              <p style="margin: 0; font-size: 11px; color: #aaaaaa; line-height: 1.6;">
                This email was sent to <strong>${email}</strong> as a final confirmation of your permanent account deletion.<br/>
                This is the last email you will receive from us regarding this account.<br/>
                © ${new Date().getFullYear()} Your Company. Thank you for being part of our journey.
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