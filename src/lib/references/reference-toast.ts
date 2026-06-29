import { toast } from "sonner";

export function showReferenceRequestSentToast(refereeName?: string) {
  const label = refereeName?.trim() ? ` to ${refereeName.trim()}` : "";

  toast.success(
    `Reference request saved${label}. Invitation emails are being sent now.`,
  );
}

export function showReferenceInvitationResentToast(refereeName?: string) {
  const label = refereeName?.trim() ? ` to ${refereeName.trim()}` : "";

  toast.success(`Invitation email resent${label}.`);
}

export function showReferenceInvitationResendErrorToast(message?: string) {
  toast.error(
    message?.trim() ||
      "Could not resend the invitation email. Please try again.",
  );
}

export function showReferenceRequestErrorToast(message?: string) {
  toast.error(message?.trim() || "Could not send reference request. Please try again.");
}

export function showReferenceCancelledToast() {
  toast.success("Reference request cancelled.");
}

export function showReferenceSubmitSuccessToast(
  autoVerified: boolean,
  rejected = false,
) {
  if (rejected) {
    toast.success("Your response has been recorded.");
    return;
  }

  if (autoVerified) {
    toast.success("Reference submitted and verified successfully.");
    return;
  }

  toast.success("Reference submitted. It is awaiting admin verification.");
}

export function showReferenceSubmitErrorToast(message?: string) {
  toast.error(message?.trim() || "Could not submit reference. Please try again.");
}
