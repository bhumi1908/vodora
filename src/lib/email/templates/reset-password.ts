type ResetPasswordEmailParams = {
  resetUrl: string;
  recipientName?: string;
};

export function buildResetPasswordEmailHtml({
  resetUrl,
  recipientName,
}: ResetPasswordEmailParams): string {
  const greeting = recipientName
    ? `Hi ${recipientName},`
    : "Hi there,";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Vodora password</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f9fafb 0%,#ffffff 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              <div style="display:inline-block;width:40px;height:40px;background-color:#2563eb;border-radius:8px;line-height:40px;font-size:20px;color:#ffffff;">&#128188;</div>
              <div style="margin-top:12px;font-size:24px;font-weight:600;color:#111827;">Vodora</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 20px;background-color:#dbeafe;border-radius:50%;line-height:64px;font-size:28px;">&#128274;</div>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                ${greeting} we received a request to reset your Vodora password. Click the button below to choose a new password. This link expires in 1 hour.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#2563eb;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                Reset password
              </a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#2563eb;word-break:break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                If you did not request a password reset, you can safely ignore this email. Your password will stay the same.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildResetPasswordEmailText({
  resetUrl,
  recipientName,
}: ResetPasswordEmailParams): string {
  const greeting = recipientName
    ? `Hi ${recipientName},`
    : "Hi there,";

  return `${greeting}

We received a request to reset your Vodora password.

Reset your password using this link (expires in 1 hour):
${resetUrl}

If you did not request a password reset, you can safely ignore this email.

— Vodora`;
}
