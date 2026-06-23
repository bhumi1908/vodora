import { buildEmailBrandHeaderHtml } from "@/lib/email/templates/email-brand-header";
import { buildEmailFallbackLinkHtml } from "@/lib/email/templates/email-fallback-link";

type ReferenceRequestEmailParams = {
  inviteUrl: string;
  candidateName: string;
  refereeName: string;
  refereeCompany: string;
  relationshipLabel: string;
  message?: string | null;
};

export function buildReferenceRequestHtml({
  inviteUrl,
  candidateName,
  refereeName,
  refereeCompany,
  relationshipLabel,
  message,
}: ReferenceRequestEmailParams): string {
  const personalMessage = message?.trim()
    ? `<div style="margin:20px 0 0;padding:20px 24px;background-color:#f9fafb;border-left:4px solid #2563eb;border-radius:8px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Personal message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">${escapeHtml(message.trim())}</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reference request from ${escapeHtml(candidateName)}</title>
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
              <div style="width:64px;height:64px;margin:0 auto 20px;background-color:#dbeafe;border-radius:50%;line-height:64px;font-size:28px;">&#128221;</div>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">Reference request</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                Hi ${escapeHtml(refereeName)}, <strong>${escapeHtml(candidateName)}</strong> has requested a professional reference from you on Vodora.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#6b7280;"><strong style="color:#111827;">Your role:</strong> ${escapeHtml(relationshipLabel)} at ${escapeHtml(refereeCompany)}</p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">Completing this reference takes about 5 minutes. Once verified, it is stored in ${escapeHtml(candidateName)}&apos;s Reference Passport and can be reused with their permission.</p>
                  </td>
                </tr>
              </table>
              ${personalMessage}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background-color:#2563eb;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                Complete Reference
              </a>
              ${buildEmailFallbackLinkHtml(inviteUrl)}
              <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">
                This link expires in 30 days. You will need to sign in or create a free Vodora candidate account using this email address.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                If you were not expecting this request, you can safely ignore this email.
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

export function buildReferenceRequestText({
  inviteUrl,
  candidateName,
  refereeName,
  refereeCompany,
  relationshipLabel,
  message,
}: ReferenceRequestEmailParams): string {
  const personalMessage = message?.trim()
    ? `\nPersonal message from ${candidateName}:\n${message.trim()}\n`
    : "";

  return `Hi ${refereeName},

${candidateName} has requested a professional reference from you on Vodora.

Your role: ${relationshipLabel} at ${refereeCompany}
${personalMessage}
Complete the reference using this link (expires in 30 days):
${inviteUrl}

You will need to sign in or create a free Vodora candidate account using the invited email address.

If you were not expecting this request, you can safely ignore this email.

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
