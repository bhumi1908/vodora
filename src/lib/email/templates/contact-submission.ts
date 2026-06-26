import { buildEmailBrandHeaderHtml } from "@/lib/email/templates/email-brand-header";

type ContactSubmissionEmailParams = {
  name: string;
  email: string;
  subjectLabel: string;
  message: string;
};

export function buildContactSubmissionHtml({
  name,
  email,
  subjectLabel,
  message,
}: ContactSubmissionEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New contact form submission</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f9fafb 0%,#ffffff 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              ${buildEmailBrandHeaderHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;text-align:center;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">New contact message</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                A visitor submitted the contact form on vodora.com.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6;color:#374151;">
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#6b7280;width:100px;vertical-align:top;">Name</td>
                  <td style="padding:8px 0;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#6b7280;vertical-align:top;">Email</td>
                  <td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#6b7280;vertical-align:top;">Subject</td>
                  <td style="padding:8px 0;">${escapeHtml(subjectLabel)}</td>
                </tr>
              </table>
              <div style="margin-top:20px;padding:20px 24px;background-color:#f9fafb;border-left:4px solid #2563eb;border-radius:8px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Message</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${escapeHtml(message)}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildContactSubmissionText({
  name,
  email,
  subjectLabel,
  message,
}: ContactSubmissionEmailParams): string {
  return [
    "New contact form submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subjectLabel}`,
    "",
    "Message:",
    message,
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
