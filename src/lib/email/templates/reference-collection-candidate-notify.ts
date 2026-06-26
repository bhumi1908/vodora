import { buildEmailBrandHeaderHtml } from "@/lib/email/templates/email-brand-header";
import { buildEmailFallbackLinkHtml } from "@/lib/email/templates/email-fallback-link";

type ReferenceCollectionCandidateNotifyEmailParams = {
  candidateName: string;
  recruiterName: string;
  companyName: string | null;
  refereeName: string;
  profileUrl: string;
};

export function buildReferenceCollectionCandidateNotifyEmailHtml({
  candidateName,
  recruiterName,
  companyName,
  refereeName,
  profileUrl,
}: ReferenceCollectionCandidateNotifyEmailParams): string {
  const recruiterLabel = companyName
    ? `${recruiterName} at ${companyName}`
    : recruiterName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reference collection started on your behalf</title>
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
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">Reference collection started</h1>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">
                Hi ${escapeHtml(candidateName)},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                <strong>${escapeHtml(recruiterLabel)}</strong> is collecting a verified reference for you from <strong>${escapeHtml(refereeName)}</strong> on Vodora.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${profileUrl}" style="display:inline-block;padding:14px 32px;background-color:#2563eb;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                View Your References
              </a>
              ${buildEmailFallbackLinkHtml(profileUrl)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildReferenceCollectionCandidateNotifyEmailText({
  candidateName,
  recruiterName,
  companyName,
  refereeName,
  profileUrl,
}: ReferenceCollectionCandidateNotifyEmailParams): string {
  const recruiterLabel = companyName
    ? `${recruiterName} at ${companyName}`
    : recruiterName;

  return `Hi ${candidateName},

${recruiterLabel} is collecting a verified reference for you from ${refereeName} on Vodora.

View your references:
${profileUrl}

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
