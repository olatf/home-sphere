interface ResetPasswordData {
  customerName: string;
}

export function getResetPasswordEmailHTML(data: ResetPasswordData) {
  const { customerName } = data;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Password Reset Successful</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
      .header { padding: 24px; text-align: center; }
      .content { padding: 24px; color: #333; }
      .muted { color: #666; font-size: 14px; }
      .button { display: inline-block; padding: 10px 16px; background:#000; color:#fff; text-decoration:none; border-radius:4px; }
      .footer { padding:16px; text-align:center; font-size:12px; color:#888; border-top:1px solid #eee }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin:0;">Password Reset Successful</h1>
      </div>
      <div class="content">
        <p style="margin:0 0 12px 0;">Hi ${customerName || 'there'},</p>
        <p class="muted">This is a quick note to confirm that your Chapters and Courses password was successfully changed.</p>

        <p style="margin-top: 12px;">If you didn't make this change, please <a href="mailto:support@ahonsi.com">contact support</a> immediately or update your password from your account settings.</p>

        <p style="margin-top: 18px; text-align:center;"><a class="button" href="https://home-sphere-zeta.vercel.app/dashboard">Manage account</a></p>
      </div>
      <div class="footer">
            <p>© ${new Date().getFullYear()} Homesphere. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
    </div>
  </body>
</html>`;
}
