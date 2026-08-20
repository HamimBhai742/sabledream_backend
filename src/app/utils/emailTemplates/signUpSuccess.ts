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

  const subject = "🌸 Welcome to Sable Dreams — You're In!";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Welcome to Sable Dreams</title>
<style>
  /* Reset */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: #f5e8ef; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased; }

  /* Outer wrapper */
  .email-outer {
    background-color: #f5e8ef;
    padding: 32px 16px 48px;
  }

  /* Main container */
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 32px rgba(186,113,152,0.13);
  }

  /* ── HERO HEADER ── */
  .hero {
    position: relative;
    background: linear-gradient(160deg, #f2c4d8 0%, #e8a0c0 40%, #d4749e 100%);
    padding: 48px 32px 0;
    text-align: center;
    overflow: hidden;
  }

  /* Watermark text behind hero content */
  .hero-watermark {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 8px;
    gap: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .hero-watermark span {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 13px;
    color: rgba(255,255,255,0.22);
    letter-spacing: 1px;
    line-height: 2;
    white-space: nowrap;
    display: block;
    transform: rotate(-8deg);
    transform-origin: center;
    width: 140%;
    margin-left: -20%;
  }

  .hero-content { position: relative; z-index: 2; }

  /* Wax seal SVG */
  .wax-seal {
    display: inline-block;
    margin-bottom: 18px;
  }

  /* Hero title — script style */
  .hero-title {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 38px;
    font-weight: 400;
    color: #6b1a3a;
    line-height: 1.15;
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }

  .hero-subtitle {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 15px;
    color: #8a2f54;
    margin-bottom: 14px;
    line-height: 1.5;
  }

  .hero-tagline {
    display: inline-block;
    font-family: Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #7a2748;
    margin-bottom: 24px;
  }

  /* Hero banner strip */
  .hero-banner {
    background: linear-gradient(90deg, #c05880, #d4749e);
    padding: 14px 24px;
    margin: 0 -32px;
    margin-top: 0;
  }
  .hero-banner p {
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #ffffff;
    text-align: center;
  }

  /* ── BODY SECTION ── */
  .body-section {
    padding: 40px 40px 0;
    background: #ffffff;
    position: relative;
    overflow: hidden;
  }

  .body-content { position: relative; z-index: 1; }

  .greeting {
    font-family: Georgia, serif;
    font-size: 22px;
    font-weight: 700;
    color: #1a1018;
    margin-bottom: 16px;
  }

  .body-text {
    font-family: Georgia, serif;
    font-size: 15px;
    line-height: 1.8;
    color: #3d2030;
    margin-bottom: 14px;
  }

  .body-text strong { color: #c05880; font-weight: 700; }

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e8c0d4, transparent);
    margin: 28px 0;
  }

  /* ── ACCOUNT DETAILS CARD ── */
  .account-card {
    background: #fef8fb;
    border: 1.5px solid #f0d0e4;
    border-radius: 14px;
    padding: 24px;
    margin: 24px 0;
  }
  .account-card-title {
    font-family: Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #c05880;
    text-align: center;
    margin-bottom: 18px;
  }
  .account-card-title::before { content: '✦  '; }
  .account-card-title::after  { content: '  ✦'; }

  .account-table {
    width: 100%;
    border-collapse: collapse;
  }
  .account-table tr {
    border-bottom: 1px solid #f0d0e4;
  }
  .account-table tr:last-child { border-bottom: none; }
  .account-table td {
    padding: 11px 12px;
    font-size: 13.5px;
    vertical-align: middle;
  }
  .account-table td:first-child {
    font-family: Arial, sans-serif;
    color: #9a6070;
    font-size: 12px;
    width: 38%;
  }
  .account-table td:last-child {
    font-family: Georgia, serif;
    color: #1a1018;
    font-weight: 400;
    text-align: right;
  }
  .status-active {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #2a7a4a;
  }

  /* ── NEXT STEPS CARD ── */
  .steps-card {
    background: #fef8fb;
    border: 1.5px solid #f0d0e4;
    border-radius: 14px;
    padding: 24px;
    margin: 0 0 24px;
  }
  .steps-card-title {
    font-family: Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #c05880;
    margin-bottom: 18px;
  }
  .steps-card-title::before { content: '🚀  '; }

  .step-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 14px;
  }
  .step-row:last-child { margin-bottom: 0; }
  .step-num {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8a0c0, #c05880);
    color: white;
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .step-text {
    font-family: Georgia, serif;
    font-size: 14px;
    line-height: 1.65;
    color: #3d2030;
  }
  .step-text strong { color: #1a1018; }

  /* ── CTA SECTION ── */
  .cta-section {
    background: linear-gradient(135deg, #fde8f2, #f8d0e8);
    border: 1.5px solid #f0c0d8;
    border-radius: 16px;
    padding: 32px 28px;
    text-align: center;
    margin: 0 0 24px;
  }
  .cta-title {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 22px;
    color: #6b1a3a;
    margin-bottom: 10px;
  }
  .cta-sub {
    font-family: Georgia, serif;
    font-size: 14px;
    color: #8a4060;
    line-height: 1.6;
    margin-bottom: 22px;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #c05880, #e8a0c0);
    color: #ffffff;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 16px;
    padding: 14px 40px;
    border-radius: 100px;
    text-decoration: none;
    letter-spacing: 0.3px;
  }

  /* ── SUPPORT SECTION ── */
  .support-section {
    background: #fff;
    border: 1.5px solid #f0d0e4;
    border-left: 4px solid #c05880;
    border-radius: 0 12px 12px 0;
    padding: 20px 22px;
    margin: 0 0 32px;
  }
  .support-title {
    font-family: Arial, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #c05880;
    margin-bottom: 10px;
  }
  .support-title::before { content: '💗  '; }
  .support-text {
    font-family: Georgia, serif;
    font-size: 14px;
    line-height: 1.7;
    color: #3d2030;
  }
  .support-text a { color: #c05880; font-weight: 700; text-decoration: none; }

  /* ── FOOTER ── */
  .footer {
    background: #fef0f6;
    border-top: 1px solid #f0d0e4;
    padding: 28px 40px 32px;
    text-align: center;
  }

  /* Three hearts */
  .footer-hearts {
    font-size: 16px;
    color: #e0b0c8;
    letter-spacing: 8px;
    margin-bottom: 18px;
  }

  /* Footer wax seal */
  .footer-seal { margin-bottom: 14px; }

  .footer-brand {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 22px;
    color: #c05880;
    margin-bottom: 4px;
  }

  .footer-tagline {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 12px;
    color: #b090a0;
    margin-bottom: 18px;
  }

  .footer-body {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #b090a0;
    line-height: 1.8;
    margin-bottom: 12px;
  }
  .footer-body a { color: #c05880; text-decoration: none; }

  .footer-links {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #c08090;
    margin-bottom: 14px;
  }
  .footer-links a {
    color: #c05880;
    text-decoration: none;
    margin: 0 6px;
  }

  .footer-copy {
    font-family: Arial, sans-serif;
    font-size: 10px;
    color: #c0a0b0;
  }

  /* ── PADDING SECTION WRAPPER ── */
  .padded { padding: 0 40px; }

</style>
</head>
<body>
<div class="email-outer">
<div class="email-container">

  <!-- ════════════════════════════════════════ -->
  <!-- HERO HEADER                              -->
  <!-- ════════════════════════════════════════ -->
  <div class="hero">

    <!-- Watermark rows -->
    <div class="hero-watermark" aria-hidden="true">
      <span>sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp; sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp;</span>
      <span>sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp; sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp;</span>
      <span>sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp; sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp;</span>
      <span>sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp; sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp;</span>
      <span>sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp; sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp;</span>
      <span>sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp; sable dreams &nbsp;✦&nbsp; dream boldly &nbsp;✦&nbsp; live softly &nbsp;✦&nbsp; dream &nbsp;✦&nbsp; believe &nbsp;✦&nbsp; become &nbsp;✦&nbsp;</span>
    </div>

    <div class="hero-content">

      <!-- Wax Seal SVG -->
      <!-- Wax Seal Stamp -->
      <div class="wax-seal" style="margin-bottom: 18px;">
        <img src="https://imglink.cc/cdn/K5i74ZtPzJ.png" alt="Sable Dreams Logo" width="72" height="72" style="display: block; margin: 0 auto; border: none; outline: none; text-decoration: none;" />
      </div>

      <!-- Title -->
      <div class="hero-title">Welcome to Sable Dreams</div>
      <div class="hero-subtitle">Where your inner world finds its rhythm. 🌷</div>
      <div class="hero-tagline">You're officially part of the family ✦</div>
    </div>

    <!-- Banner strip -->
    <div class="hero-banner">
      <p>🎉 &nbsp; Account Successfully Created — You're All Set!</p>
    </div>
  </div>

  <!-- ════════════════════════════════════════ -->
  <!-- BODY                                     -->
  <!-- ════════════════════════════════════════ -->
  <div class="body-section">

    <div class="body-content">

      <!-- Greeting -->
      <div class="greeting">Hello, ${userName}! 💕</div>

      <p class="body-text">
        We're so happy you're here. Your <strong>Sable Dreams</strong> account is live and ready to explore — a space created for reflection, affirmation, and becoming.
      </p>
      <p class="body-text">
        Every detail was designed with intention, and now it's yours to experience.
      </p>
      <p class="body-text">
        Take a breath, open your dashboard, and begin your moment of centering. 🌸
      </p>

      <div class="divider"></div>

      <!-- Account Details -->
      <div class="account-card">
        <div class="account-card-title">Your Account</div>
        <table class="account-table">
          <tr>
            <td>Account Status</td>
            <td><span class="status-active">✅ Active</span></td>
          </tr>
          <tr>
            <td>Email</td>
            <td><a href="mailto:${email}" style="color:#c05880;text-decoration:none;">${email}</a></td>
          </tr>
          <tr>
            <td>Member Since</td>
            <td>${joinedAt}</td>
          </tr>
        </table>
      </div>

      <div class="divider"></div>

      <!-- Next Steps -->
      <div class="steps-card">
        <div class="steps-card-title">Get Started in 3 Steps</div>
        <div class="step-row">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Complete your profile</strong> — add a photo and make it yours.</div>
        </div>
        <div class="step-row">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Explore Sable Dreams</strong> — discover reflections, affirmations, and rituals that speak to you.</div>
        </div>
        <div class="step-row">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Enable notifications</strong> — gentle reminders to pause, breathe, and return to yourself.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- ════════════════════════════════════════ -->
  <!-- CTA SECTION                              -->
  <!-- ════════════════════════════════════════ -->
  <div class="padded" style="padding-top:0; padding-bottom:0; background:#fff; position:relative; z-index:1;">
    <div class="cta-section">
      <div class="cta-title">Your journey starts now 🌸</div>
      <div class="cta-sub">Everything is ready and waiting for you. 💕</div>
      <a href="#" class="cta-button">Go to My Dashboard ✨</a>
    </div>
  </div>

  <!-- ════════════════════════════════════════ -->
  <!-- SUPPORT SECTION                          -->
  <!-- ════════════════════════════════════════ -->
  <div class="padded" style="background:#fff; padding-top:0; padding-bottom:32px; position:relative; z-index:1;">
    <div class="support-section">
      <div class="support-title">Need a Little Help Getting Started?</div>
      <p class="support-text">
        Our team is here for you every step of the way. Don't hesitate to
        <a href="#">reach out to us</a> anytime — we'd love to help you make the most of your Sable Dreams experience. 🌸
      </p>
    </div>
  </div>

  <!-- ════════════════════════════════════════ -->
  <!-- FOOTER                                   -->
  <!-- ════════════════════════════════════════ -->
  <div class="footer">

    <div class="footer-hearts">♡ &nbsp; ♡ &nbsp; ♡</div>

    <!-- Footer wax seal (smaller) -->
    <div class="footer-seal" style="margin-bottom: 14px;">
      <img src="https://imglink.cc/cdn/K5i74ZtPzJ.png" alt="Sable Dreams Logo" width="52" height="52" style="display: block; margin: 0 auto; border: none; outline: none; text-decoration: none;" />
    </div>

    <div class="footer-brand">Sable Dreams</div>
    <div class="footer-tagline">Dream. Believe. Become.</div>

    <p class="footer-body">
      You're receiving this because you created an account at Sable Dreams.<br>
      Questions? <a href="#">Contact our support team</a> — we're always here for you.
    </p>

    <div class="footer-links">
      <a href="#">Privacy Policy</a> &nbsp;·&nbsp;
      <a href="#">Terms of Service</a> &nbsp;·&nbsp;
      <a href="#">Unsubscribe</a>
    </div>

    <div class="footer-copy">© ${new Date().getFullYear()} Sable Dreams. Made with 🌸 for you.</div>
  </div>

</div>
</div>
</body>
</html>
  `;

  await sendEmail(email, subject, html);
};