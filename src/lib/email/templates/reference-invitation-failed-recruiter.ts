import { buildEmailBrandHeaderHtml } from "@/lib/email/templates/email-brand-header";
import { buildEmailFallbackLinkHtml } from "@/lib/email/templates/email-fallback-link";

type ReferenceInvitationFailedRecruiterEmailParams = {
  recruiterName: string;
  candidateName: string;
  refereeName: string;
  refereeEmail: string;
  historyUrl: string;
};

export function buildReferenceInvitationFailedRecruiterEmailHtml({
  recruiterName,
  candidateName,
  refereeName,
  refereeEmail,
  historyUrl,
}: ReferenceInvitationFailedRecruiterEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reference invitation could not be delivered</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">Reference invitation not delivered</h1>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">
                Hi ${escapeHtml(recruiterName)},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                We saved your reference request for <strong>${escapeHtml(candidateName)}</strong>, but we could not deliver the invitation email to referee <strong>${escapeHtml(refereeName)}</strong> (${escapeHtml(refereeEmail)}) after multiple attempts.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#991b1b;">
                      Open Reference History in Vodora and use <strong>Resend invitation</strong> to try again.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${historyUrl}" style="display:inline-block;padding:14px 32px;background-color:#2563eb;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                Open Reference History
              </a>
              ${buildEmailFallbackLinkHtml(historyUrl)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildReferenceInvitationFailedRecruiterEmailText({
  recruiterName,
  candidateName,
  refereeName,
  refereeEmail,
  historyUrl,
}: ReferenceInvitationFailedRecruiterEmailParams): string {
  return `Hi ${recruiterName},

We saved your reference request for ${candidateName}, but we could not deliver the invitation email to referee ${refereeName} (${refereeEmail}) after multiple attempts.

Open Reference History in Vodora and use Resend invitation to try again:
${historyUrl}

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
