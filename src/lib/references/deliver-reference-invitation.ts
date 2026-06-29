import { retryAsync } from "@/lib/email/retry-async";
import { notifyRecruiterReferenceInvitationFailed } from "@/lib/references/notify-recruiter-reference-invitation-failed";
import type { DeliverReferenceInvitationParams } from "@/lib/references/reference-request-email.types";
import { sendReferenceRequestEmail } from "@/lib/references/send-reference-request-email";

export type DeliverReferenceInvitationResult =
  | { success: true }
  | { success: false; error: string };

export async function deliverReferenceInvitation(
  params: DeliverReferenceInvitationParams,
): Promise<DeliverReferenceInvitationResult> {
  const result = await retryAsync(
    () => sendReferenceRequestEmail(params),
    {
      attempts: 2,
      label: `Reference invitation email to ${params.refereeEmail}`,
    },
  );

  if (result.success) {
    return { success: true };
  }

  const recruiterEmail = params.recruiterEmail?.trim();

  if (recruiterEmail && params.recruiterName?.trim() && params.historyUrl?.trim()) {
    try {
      await notifyRecruiterReferenceInvitationFailed({
        recruiterEmail,
        recruiterName: params.recruiterName.trim(),
        candidateName: params.candidateName,
        refereeName: params.refereeName,
        refereeEmail: params.refereeEmail,
        historyUrl: params.historyUrl.trim(),
      });
    } catch (error) {
      console.error(
        "Unexpected error notifying recruiter about invitation failure:",
        error,
      );
    }
  }

  return { success: false, error: result.error };
}
