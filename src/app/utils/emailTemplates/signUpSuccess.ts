import sendEmail from "../sendEmail";

interface WelcomeSableDreamData {
  userName: string;
  email: string;
  joinedAt: string;
}

export const welcomeSableDreamTemplate = async (
  data: WelcomeSableDreamData,
) => {
  const { userName, email, joinedAt } = data;

  const subject = "🌸 Welcome to Sable Dream — You're In!";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Sable Dream</title>
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
              padding: 52px 48px 44px;
              text-align: center;
            ">
              <!-- Logo -->
              <img
                src="https://imglink.cc/cdn/vnw0bUtBsF.png"
                height="44"
                alt="Sable Dream"
                style="display: block; margin: 0 auto 24px;"
              />

              <!-- Welcome icon circle -->
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.6);
                border: 2px solid rgba(255,255,255,0.9);
                border-radius: 50%;
                width: 80px;
                height: 80px;
                line-height: 80px;
                text-align: center;
                font-size: 36px;
                margin-bottom: 22px;
                box-shadow: 0 4px 24px rgba(233,30,99,0.2);
              ">🌸</div>

              <h1 style="
                margin: 0 0 10px;
                color: #880e4f;
                font-size: 32px;
                font-weight: 400;
                font-style: italic;
                font-family: Georgia, 'Times New Roman', serif;
                letter-spacing: 0.4px;
              ">Welcome to Sable Dream</h1>

              <p style="
                margin: 0 0 18px;
                color: rgba(136,14,79,0.65);
                font-size: 14px;
                line-height: 1.7;
                font-family: Georgia, 'Times New Roman', serif;
                font-style: italic;
              ">Where every dream begins with a single step 🌷</p>

              <p style="
                margin: 0;
                color: rgba(136,14,79,0.5);
                font-size: 11px;
                letter-spacing: 2.5px;
                text-transform: uppercase;
                font-weight: 600;
              ">You're officially part of the family ✦</p>
            </td>
          </tr>

          <!-- ===== PINK ACCENT STRIP ===== -->
          <tr>
            <td style="
              background: linear-gradient(90deg, #f48fb1 0%, #e91e63 50%, #f48fb1 100%);
              padding: 12px 48px;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                color: #fff0f6;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-weight: 700;
              ">🎉 Account successfully created — you're all set!</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding: 44px 48px 36px; background: #ffffff;">

              <!-- Greeting -->
              <p style="
                margin: 0 0 14px;
                font-size: 22px;
                color: #3d0020;
                font-family: Georgia, 'Times New Roman', serif;
                font-weight: 400;
              ">Hello, ${userName}! 💕</p>

              <p style="margin: 0 0 32px; font-size: 14px; color: #8c5c6b; line-height: 1.9;">
                We are absolutely thrilled to have you join <strong style="color: #c2185b;">Sable Dream</strong>.
                Your account is now live and ready to explore. We've built something
                truly special here, and we can't wait for you to discover everything
                we have in store for you. This is just the beginning of something beautiful. 🌸
              </p>

              <!-- ===== ACCOUNT DETAILS BOX ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: linear-gradient(135deg, #fdf0f4 0%, #fce4ec 100%);
                border: 1px solid rgba(233,30,99,0.2);
                border-radius: 14px;
                margin-bottom: 10px;
              ">
                <tr>
                  <td style="padding: 28px 24px; text-align: center;">

                    <p style="
                      margin: 0 0 16px;
                      font-size: 12px;
                      color: #c2185b;
                      text-transform: uppercase;
                      letter-spacing: 1.5px;
                      font-weight: 700;
                    ">✦ Your Account</p>

                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; width: 100%; max-width: 340px;">

                      <!-- Row: Status -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 10px 10px 0 0;
                          border: 1px solid rgba(233,30,99,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          color: #8c5c6b;
                        ">Account Status</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 10px 10px 0 0;
                          border: 1px solid rgba(233,30,99,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 600;
                          color: #2e7d32;
                          text-align: right;
                        ">✅ Active</td>
                      </tr>

                      <!-- Row: Email -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #fff9fb;
                          border: 1px solid rgba(233,30,99,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          color: #8c5c6b;
                        ">Email</td>
                        <td style="
                          padding: 10px 16px;
                          background: #fff9fb;
                          border: 1px solid rgba(233,30,99,0.12);
                          border-bottom: none;
                          font-size: 13px;
                          font-weight: 500;
                          color: #3d0020;
                          text-align: right;
                        ">${email}</td>
                      </tr>

                      <!-- Row: Member Since -->
                      <tr>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 0 0 0 10px;
                          border: 1px solid rgba(233,30,99,0.12);
                          font-size: 13px;
                          color: #8c5c6b;
                        ">Member Since</td>
                        <td style="
                          padding: 10px 16px;
                          background: #ffffff;
                          border-radius: 0 0 10px 0;
                          border: 1px solid rgba(233,30,99,0.12);
                          font-size: 13px;
                          font-weight: 500;
                          color: #3d0020;
                          text-align: right;
                        ">${joinedAt}</td>
                      </tr>

                    </table>

                  </td>
                </tr>
              </table>

              <!-- Email note -->
              <p style="
                margin: 0 0 32px;
                font-size: 12px;
                color: #c4a0b0;
                text-align: center;
              ">Registered with: <strong style="color: #c2185b;">${email}</strong></p>

              <!-- ===== DIVIDER ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px;">
                <tr>
                  <td style="border-top: 1px solid rgba(233,30,99,0.15);"></td>
                  <td style="padding: 0 14px; font-size: 16px; color: #f48fb1; white-space: nowrap;">🌷</td>
                  <td style="border-top: 1px solid rgba(233,30,99,0.15);"></td>
                </tr>
              </table>

              <!-- ===== GET STARTED STEPS ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #f8f9fc;
                border: 1px solid rgba(233,30,99,0.1);
                border-radius: 14px;
                margin-bottom: 24px;
              ">
                <tr>
                  <td style="padding: 20px 22px;">
                    <p style="
                      margin: 0 0 16px;
                      font-size: 12px;
                      color: #c2185b;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      font-weight: 700;
                    ">🚀 Get Started in 3 Steps</p>

                    <!-- Step 1 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 14px;">
                      <tr>
                        <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                          <div style="
                            width: 24px;
                            height: 24px;
                            background: linear-gradient(135deg, #f48fb1, #e91e63);
                            border-radius: 50%;
                            text-align: center;
                            line-height: 24px;
                            font-size: 11px;
                            font-weight: 700;
                            color: #ffffff;
                          ">1</div>
                        </td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #8c5c6b; line-height: 1.6;">
                          <strong style="color: #3d0020;">Complete your profile</strong> — add a photo and fill in your personal details to get started.
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 14px;">
                      <tr>
                        <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                          <div style="
                            width: 24px;
                            height: 24px;
                            background: linear-gradient(135deg, #f48fb1, #e91e63);
                            border-radius: 50%;
                            text-align: center;
                            line-height: 24px;
                            font-size: 11px;
                            font-weight: 700;
                            color: #ffffff;
                          ">2</div>
                        </td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #8c5c6b; line-height: 1.6;">
                          <strong style="color: #3d0020;">Explore Sable Dream</strong> — browse everything we have to offer and find what inspires you.
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                          <div style="
                            width: 24px;
                            height: 24px;
                            background: linear-gradient(135deg, #f48fb1, #e91e63);
                            border-radius: 50%;
                            text-align: center;
                            line-height: 24px;
                            font-size: 11px;
                            font-weight: 700;
                            color: #ffffff;
                          ">3</div>
                        </td>
                        <td style="padding-left: 10px; font-size: 13.5px; color: #8c5c6b; line-height: 1.6;">
                          <strong style="color: #3d0020;">Enable notifications</strong> — stay in the loop with the latest updates, offers, and news just for you.
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ===== GO TO DASHBOARD CTA ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: linear-gradient(135deg, #fdf0f4 0%, #fce4ec 100%);
                border: 1px solid rgba(233,30,99,0.18);
                border-radius: 14px;
                margin-bottom: 24px;
              ">
                <tr>
                  <td style="padding: 28px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 16px; color: #3d0020; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-style: italic;">
                      Your journey starts now 🌸
                    </p>
                    <p style="margin: 0 0 20px; font-size: 13.5px; color: #8c5c6b; line-height: 1.7;">
                      Head over to your dashboard to begin your Sable Dream experience.<br/>
                      Everything is ready and waiting just for you. 💕
                    </p>
                    <a href="#" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #f48fb1 0%, #e91e63 100%);
                      color: #ffffff;
                      text-decoration: none;
                      font-size: 14px;
                      font-weight: 700;
                      padding: 14px 36px;
                      border-radius: 50px;
                      letter-spacing: 0.5px;
                      box-shadow: 0 6px 18px rgba(233,30,99,0.35);
                    ">Go to My Dashboard 🌷</a>
                  </td>
                </tr>
              </table>

              <!-- ===== NEED HELP ===== -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #fff5f7;
                border: 1px solid rgba(233,30,99,0.15);
                border-left: 4px solid #f48fb1;
                border-radius: 10px;
              ">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #880e4f; text-transform: uppercase; letter-spacing: 0.8px;">💌 Need Help Getting Started?</p>
                    <p style="margin: 0; font-size: 13.5px; color: #8c5c6b; line-height: 1.6;">
                      Our support team is here for you every step of the way.
                      Don't hesitate to <a href="#" style="color: #e91e63; font-weight: 600; text-decoration: none;">reach out to us</a> anytime —
                      we'd love to help you make the most of Sable Dream. 🌸
                    </p>
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
                alt="Sable Dream"
                style="display: block; margin: 0 auto 14px; opacity: 0.5;"
              />

              <p style="margin: 0 0 10px; font-size: 12px; color: #c48098; line-height: 1.7;">
                You're receiving this because you created an account at Sable Dream.<br/>
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
                This welcome email was sent to <strong>${email}</strong> upon successful account registration.<br/>
                © ${new Date().getFullYear()} Sable Dream. Made with 🌸 for you.
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