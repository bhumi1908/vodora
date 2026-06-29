import { sendEmail } from "@/lib/email/smtp";
import {
  buildReferenceInvitationFailedRecruiterEmailHtml,
  buildReferenceInvitationFailedRecruiterEmailText,
} from "@/lib/email/templates/reference-invitation-failed-recruiter";

type NotifyRecruiterReferenceInvitationFailedParams = {
  recruiterEmail: string;
  recruiterName: string;
  candidateName: string;
  refereeName: string;
  refereeEmail: string;
  historyUrl: string;
};

export async function notifyRecruiterReferenceInvitationFailed(
  params: NotifyRecruiterReferenceInvitationFailedParams,
): Promise<void> {
  const emailResult = await sendEmail({
    to: params.recruiterEmail,
    subject: `Reference invitation could not be delivered to ${params.refereeName}`,
    html: buildReferenceInvitationFailedRecruiterEmailHtml({
      recruiterName: params.recruiterName,
      candidateName: params.candidateName,
      refereeName: params.refereeName,
      refereeEmail: params.refereeEmail,
      historyUrl: params.historyUrl,
    }),
    text: buildReferenceInvitationFailedRecruiterEmailText({
      recruiterName: params.recruiterName,
      candidateName: params.candidateName,
      refereeName: params.refereeName,
      refereeEmail: params.refereeEmail,
      historyUrl: params.historyUrl,
    }),
  });

  if (!emailResult.success) {
    console.error(
      "Failed to notify recruiter about reference invitation failure:",
      emailResult.error,
    );
  }
}
