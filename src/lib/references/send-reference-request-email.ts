import { sendEmail } from "@/lib/email/smtp";
import {
  buildReferenceRequestHtml,
  buildReferenceRequestText,
} from "@/lib/email/templates/reference-request";
import { createAdminClient } from "@/lib/supabase/admin";

import type { ReferenceRequestEmailParams } from "@/lib/references/reference-request-email.types";

export async function sendReferenceRequestEmail(
  params: ReferenceRequestEmailParams,
): Promise<void> {
  const emailResult = await sendEmail({
    to: params.refereeEmail,
    subject: params.recruiterName?.trim()
      ? `Reference request for ${params.candidateName} on Vodora`
      : `Reference request from ${params.candidateName} on Vodora`,
    html: buildReferenceRequestHtml({
      inviteUrl: params.inviteUrl,
      candidateName: params.candidateName,
      refereeName: params.refereeName,
      refereeEmail: params.refereeEmail,
      refereeCompany: params.refereeCompany,
      relationshipLabel: params.relationshipLabel,
      message: params.message,
      recruiterName: params.recruiterName,
      recruiterCompany: params.recruiterCompany,
    }),
    text: buildReferenceRequestText({
      inviteUrl: params.inviteUrl,
      candidateName: params.candidateName,
      refereeName: params.refereeName,
      refereeEmail: params.refereeEmail,
      refereeCompany: params.refereeCompany,
      relationshipLabel: params.relationshipLabel,
      message: params.message,
      recruiterName: params.recruiterName,
      recruiterCompany: params.recruiterCompany,
    }),
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reference_requests")
    .update({ invitation_sent_at: new Date().toISOString() })
    .eq("id", params.referenceRequestId);

  if (error) {
    console.error("Failed to update invitation_sent_at:", error);
  }
}
