export function getOnboardingEmailHTML(userName?: string): string {
  const name = userName?.trim() || 'there';
  const BRAND = '#6366f1';
  const YEAR = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Welcome to HomeSphere</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f7f8;
      color: #0f172a;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Helvetica, Arial, sans-serif;
    }

    .container {
      max-width: 680px;
      margin: 40px auto;
      padding: 24px;
    }

    .card {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .header {
      padding: 36px 32px 28px;
      background: linear-gradient(
        180deg,
        rgba(99, 102, 241, 0.12),
        rgba(255, 255, 255, 0)
      );
    }

    .brand {
      font-size: 12px;
      letter-spacing: 0.22em;
      font-weight: 700;
      color: ${BRAND};
      text-transform: uppercase;
    }

    .title {
      margin: 14px 0 0;
      font-size: 24px;
      font-weight: 500;
      line-height: 1.3;
    }

    .content {
      padding: 32px;
    }

    .message {
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
      margin: 0;
    }

    .note {
      margin-top: 24px;
      font-size: 13px;
      color: #6b7280;
    }

    .footer {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">HomeSphere</div>
        <h1 class="title">Welcome aboard</h1>
      </div>

      <div class="content">
        <p class="message">
          Hi ${name},
          <br /><br />
          Thank you for completing your onboarding with HomeSphere.
          We’ve successfully received your information, and your account
          verification is currently in progress.
          <br /><br />
          Our team will review your submission and notify you once the
          verification process is complete. If we need any additional
          information, we’ll reach out directly.
        </p>

        <p class="note">
          If you did not initiate this request, please reply to this email
          immediately so we can assist you.
        </p>
      </div>

      <div class="footer">
        © ${YEAR} HomeSphere. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}
