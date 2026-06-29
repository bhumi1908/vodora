import { after } from "next/server";

import {
  buildResetPasswordUrl,
  createPasswordResetTokenForEmail,
} from "@/lib/auth/password-reset";
import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { retryAsync } from "@/lib/email/retry-async";
import { sendEmail } from "@/lib/email/smtp";
import {
  buildReferenceCollectionCandidateInviteEmailHtml,
  buildReferenceCollectionCandidateInviteEmailText,
} from "@/lib/email/templates/reference-collection-candidate-invite";
import {
  buildReferenceCollectionCandidateNotifyEmailHtml,
  buildReferenceCollectionCandidateNotifyEmailText,
} from "@/lib/email/templates/reference-collection-candidate-notify";
import {
  buildResetPasswordEmailHtml,
  buildResetPasswordEmailText,
} from "@/lib/email/templates/reset-password";

type QueueReferenceCollectionCandidateEmailParams = {
  candidateEmail: string;
  candidateName: string;
  recruiterName: string;
  companyName: string | null;
  refereeName: string;
  origin: string;
  isNewInvite: boolean;
  isInvitedStub: boolean;
};

async function sendReferenceCollectionCandidateEmail(
  params: QueueReferenceCollectionCandidateEmailParams,
): Promise<void> {
  if (!EMAIL_FEATURES_ENABLED) {
    return;
  }

  const loginUrl = new URL("/login", params.origin);
  loginUrl.searchParams.set("email", params.candidateEmail.trim());

  if (params.isNewInvite || params.isInvitedStub) {
    const tokenPayload = await createPasswordResetTokenForEmail(
      params.candidateEmail,
    );

    if (!tokenPayload) {
      throw new Error("Unable to create password setup link.");
    }

    const setupPasswordUrl = buildResetPasswordUrl(
      params.origin,
      tokenPayload.token,
    );

    const emailResult = await sendEmail({
      to: params.candidateEmail,
      subject: `${params.recruiterName} started your Vodora Reference Passport`,
      html: buildReferenceCollectionCandidateInviteEmailHtml({
        candidateName: params.candidateName,
        candidateEmail: params.candidateEmail,
        recruiterName: params.recruiterName,
        companyName: params.companyName,
        setupPasswordUrl,
        loginUrl: loginUrl.toString(),
      }),
      text: buildReferenceCollectionCandidateInviteEmailText({
        candidateName: params.candidateName,
        candidateEmail: params.candidateEmail,
        recruiterName: params.recruiterName,
        companyName: params.companyName,
        setupPasswordUrl,
        loginUrl: loginUrl.toString(),
      }),
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    return;
  }

  const profileUrl = new URL("/my-profile", params.origin).toString();
  const emailResult = await sendEmail({
    to: params.candidateEmail,
    subject: "A reference is being collected on your behalf",
    html: buildReferenceCollectionCandidateNotifyEmailHtml({
      candidateName: params.candidateName,
      recruiterName: params.recruiterName,
      companyName: params.companyName,
      refereeName: params.refereeName,
      profileUrl,
    }),
    text: buildReferenceCollectionCandidateNotifyEmailText({
      candidateName: params.candidateName,
      recruiterName: params.recruiterName,
      companyName: params.companyName,
      refereeName: params.refereeName,
      profileUrl,
    }),
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error);
  }
}

export function queueReferenceCollectionCandidateEmail(
  params: QueueReferenceCollectionCandidateEmailParams,
): void {
  after(async () => {
    const result = await retryAsync(
      () => sendReferenceCollectionCandidateEmail(params),
      {
        attempts: 2,
        label: `Reference collection candidate email to ${params.candidateEmail}`,
      },
    );

    if (!result.success) {
      console.error(
        "Background reference collection candidate email failed:",
        result.error,
      );
    }
  });
}

export async function sendInvitedCandidateSetupLinkEmail(
  email: string,
  origin: string,
  recipientName: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!EMAIL_FEATURES_ENABLED) {
    return {
      success: false,
      error: "Email delivery is not configured.",
    };
  }

  const tokenPayload = await createPasswordResetTokenForEmail(email);

  if (!tokenPayload) {
    return {
      success: false,
      error: "Unable to send password setup link.",
    };
  }

  const resetUrl = buildResetPasswordUrl(origin, tokenPayload.token);
  const emailResult = await sendEmail({
    to: email,
    subject: "Set your Vodora password",
    html: buildResetPasswordEmailHtml({
      resetUrl,
      recipientName,
    }),
    text: buildResetPasswordEmailText({
      resetUrl,
      recipientName,
    }),
  });

  if (!emailResult.success) {
    return {
      success: false,
      error: emailResult.error,
    };
  }

  return { success: true };
}
