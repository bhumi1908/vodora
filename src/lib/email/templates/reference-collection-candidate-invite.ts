import { buildEmailBrandHeaderHtml } from "@/lib/email/templates/email-brand-header";
import { buildEmailFallbackLinkHtml } from "@/lib/email/templates/email-fallback-link";

type ReferenceCollectionCandidateInviteEmailParams = {
  candidateName: string;
  candidateEmail: string;
  recruiterName: string;
  companyName: string | null;
  setupPasswordUrl: string;
  loginUrl: string;
};

export function buildReferenceCollectionCandidateInviteEmailHtml({
  candidateName,
  candidateEmail,
  recruiterName,
  companyName,
  setupPasswordUrl,
  loginUrl,
}: ReferenceCollectionCandidateInviteEmailParams): string {
  const recruiterLabel = companyName
    ? `${recruiterName} at ${companyName}`
    : recruiterName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Vodora profile has been started</title>
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
              <div style="width:64px;height:64px;margin:0 auto 20px;background-color:#dbeafe;border-radius:50%;line-height:64px;font-size:28px;">&#128100;</div>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111827;">Your Reference Passport is ready to claim</h1>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">
                Hi ${escapeHtml(candidateName)},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                <strong>${escapeHtml(recruiterLabel)}</strong> has started collecting a verified professional reference for you on Vodora.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#6b7280;">We created a free Vodora profile for <strong style="color:#111827;">${escapeHtml(candidateEmail)}</strong>. Set your password to access your references, manage your Reference Passport, and reuse verified references with future employers.</p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">If a referee completes a reference before you sign in, it will already be waiting in your account.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${setupPasswordUrl}" style="display:inline-block;padding:14px 32px;background-color:#2563eb;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
                Set Password &amp; Access Profile
              </a>
              ${buildEmailFallbackLinkHtml(setupPasswordUrl)}
              <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">
                After setting your password, sign in using <strong style="color:#6b7280;">${escapeHtml(candidateEmail)}</strong> at <a href="${loginUrl}" style="color:#2563eb;text-decoration:none;">Vodora</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                If you were not expecting this, you can safely ignore this email.
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

export function buildReferenceCollectionCandidateInviteEmailText({
  candidateName,
  candidateEmail,
  recruiterName,
  companyName,
  setupPasswordUrl,
  loginUrl,
}: ReferenceCollectionCandidateInviteEmailParams): string {
  const recruiterLabel = companyName
    ? `${recruiterName} at ${companyName}`
    : recruiterName;

  return `Hi ${candidateName},

${recruiterLabel} has started collecting a verified professional reference for you on Vodora.

We created a free Vodora profile for ${candidateEmail}. Set your password to access your references, manage your Reference Passport, and reuse verified references with future employers.

If a referee completes a reference before you sign in, it will already be waiting in your account.

Set your password using this link (expires in 1 hour):
${setupPasswordUrl}

After setting your password, sign in at ${loginUrl} using ${candidateEmail}.

If you were not expecting this, you can safely ignore this email.

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
