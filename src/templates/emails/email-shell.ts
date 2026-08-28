type EmailShellOptions = {
  bodyHtml: string;
  button?: {
    label: string;
    href: string;
  } | null;
};

export function renderEmailShell(options: EmailShellOptions): string {
  const { bodyHtml, button = null } = options;

  const buttonHtml = button
    ? `
      <div style="margin: 40px 0; text-align: center;">
        <a
          href="${button.href}"
          style="display: inline-block; font-family: 'Libre Franklin', Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #ffffff; background-color: #1b5e40; padding: 14px 32px; text-decoration: none; font-weight: 500; border: 1px solid #1b5e40;"
        >${button.label}</a>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Home Sphere</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Libre+Franklin:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { 
      -webkit-text-size-adjust: 100%; 
      -ms-text-size-adjust: 100%; 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      -webkit-font-smoothing: antialiased;
      background-color: #f5f5f5;
      font-family: 'Libre Franklin', Arial, sans-serif;
      color: #1a1a1a;
    }

    img { 
      -ms-interpolation-mode: bicubic; 
      border: 0; 
      height: auto; 
      line-height: 100%; 
      outline: none; 
      text-decoration: none; 
      display: block; 
    }

    a { 
      color: inherit; 
    }

    a:hover { 
      text-decoration: none !important; 
    }

    @media screen and (max-width: 640px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .header-pad      { padding: 20px 16px 14px !important; }
      .hero-pad        { padding: 28px 20px !important; }
      .section-pad     { padding: 24px 20px !important; }
      .body-pad        { padding: 20px 20px 32px !important; }
      .footer-pad      { padding: 24px 20px !important; }
      .header-logo     { width: 70px !important; }
      .hero-h2         { font-size: 22px !important; }
      .body-text       { font-size: 15px !important; line-height: 1.75 !important; }
    }
  </style>
</head>

<body style="background-color: #f5f5f5; padding: 0; margin: 0;">
  <div style="background-color: #f5f5f5; padding: 16px 0;">

    <div class="email-container" style="width: 640px; max-width: 100%; margin: 0 auto; background-color: #ffffff;">

      <!-- Header -->
      <div class="header-pad" style="background-color: #1b5e40; padding: 28px 48px 16px; text-align: center; border-bottom: 1px solid #e8e8e8;">
        <img
          src="https://lmxwuphqnlwjfrfhcpcp.supabase.co/storage/v1/object/public/email-assets/t413_logo.png"
          alt="Home Sphere"
          class="header-logo"
          style="width: 90px; height: auto; margin: 0 auto; border-radius: 10%; display: block;"
        />
      </div>

      <!-- Body -->
      <div class="body-pad" style="background-color: #ffffff; padding: 44px 48px 20px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; line-height: 1.8; color: #1a1a1a; text-align: center;">
        ${bodyHtml}
        ${buttonHtml}
      </div>

      <div class="section-pad" style="background-color: #1b5e40; padding: 36px 48px; text-align: center;">
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 19px; color: #ffffff; font-style: italic; margin-bottom: 8px;">
            "Your trusted partner in property management"
        </div>
        <div style="font-family: 'Libre Franklin', Arial, sans-serif; font-size: 8px; letter-spacing: 5px; text-transform: uppercase; color: rgba(255,255,255,0.45);">
          Home Sphere
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-pad" style="padding: 44px 48px; text-align: center; background-color: #ffffff;">
        <hr style="border: none; border-top: 1px solid #dcdcdc; margin: 0 auto 28px; width: 100%;" />

        <img
          src="https://lmxwuphqnlwjfrfhcpcp.supabase.co/storage/v1/object/public/email-assets/t413_logo.png"
          alt="Home Sphere"
          style="width: 90px; height: auto; margin: 0 auto 24px; opacity: 0.9; border-radius: 10%; display: block;"
        />

        <div style="margin-bottom: 24px;">
          <a href="https://homesphere.com/" style="font-family: 'Libre Franklin', Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #666666; text-decoration: none; margin: 0 14px; display: inline-block;">Website</a>
          <a href="https://instagram.com/homesphere" style="font-family: 'Libre Franklin', Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #666666; text-decoration: none; margin: 0 14px; display: inline-block;">Instagram</a>
          <a href="https://homesphere.com/blog" style="font-family: 'Libre Franklin', Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #666666; text-decoration: none; margin: 0 14px; display: inline-block;">Blog</a>
        </div>

        <hr style="border: none; border-top: 1px solid #dcdcdc; margin: 0 auto 20px; width: 15%;" />

        <div style="font-family: 'Libre Franklin', Arial, sans-serif; font-size: 13px; color: #666666; line-height: 1.9; letter-spacing: 0.3px;">
          You are receiving this because you are part of the Home Sphere community.<br />
          <a href="#" style="text-decoration: underline; color: #666666;">Unsubscribe</a> &nbsp;&middot;&nbsp;
          <a href="#" style="text-decoration: underline; color: #666666;">Update preferences</a><br /><br />
          &copy; 2026 Home Sphere. All rights reserved.<br />
          London, United Kingdom
        </div>
      </div>

    </div>
  </div>

</body>
</html>`;
}
