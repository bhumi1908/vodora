import { buildEmailBrandHeaderHtml } from "@/lib/email/templates/email-brand-header";

type ContactConfirmationEmailParams = {
  recipientName: string;
  subjectLabel: string;
  urgentContactEmail?: string | null;
};

function buildUrgentContactHtml(email: string): string {
  const safeEmail = escapeHtml(email);

  return ` If your matter is urgent, you can also reach us at <a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a>.`;
}

function buildUrgentContactText(email: string): string {
  return ` If your matter is urgent, you can also reach us at ${email}.`;
}

export function buildContactConfirmationHtml({
  recipientName,
  subjectLabel,
  urgentContactEmail,
}: ContactConfirmationEmailParams): string {
  const greeting = recipientName.trim()
    ? `Hi ${escapeHtml(recipientName.trim())},`
    : "Hi there,";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f9fafb 0%,#ffffff 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              ${buildEmailBrandHeaderHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 20px;background-color:#dbeafe;border-radius:50%;line-height:64px;font-size:28px;">&#10003;</div>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">We received your message</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;text-align:left;">
                ${greeting}
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4b5563;text-align:left;">
                Thank you for contacting Vodora. Your enquiry regarding <strong>${escapeHtml(subjectLabel)}</strong> has been received and our team is reviewing it.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;text-align:left;">
                We aim to respond within one business day.${urgentContactEmail ? buildUrgentContactHtml(urgentContactEmail) : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                This is an automated confirmation. Please do not reply to this email.
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

export function buildContactConfirmationText({
  recipientName,
  subjectLabel,
  urgentContactEmail,
}: ContactConfirmationEmailParams): string {
  const greeting = recipientName.trim()
    ? `Hi ${recipientName.trim()},`
    : "Hi there,";

  return `${greeting}

Thank you for contacting Vodora. Your enquiry regarding "${subjectLabel}" has been received and our team is reviewing it.

We aim to respond within one business day.${urgentContactEmail ? buildUrgentContactText(urgentContactEmail) : ""}

This is an automated confirmation. Please do not reply to this email.

— Vodora`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
