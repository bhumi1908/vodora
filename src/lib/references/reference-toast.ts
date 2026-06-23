import { toast } from "sonner";

export function showReferenceRequestSentToast(refereeName?: string) {
  const label = refereeName?.trim() ? ` to ${refereeName.trim()}` : "";

  toast.success(`Reference request sent${label}. The email will be delivered shortly.`);
}

export function showReferenceRequestErrorToast(message?: string) {
  toast.error(message?.trim() || "Could not send reference request. Please try again.");
}

export function showReferenceCancelledToast() {
  toast.success("Reference request cancelled.");
}

export function showReferenceSubmitSuccessToast(autoVerified: boolean) {
  if (autoVerified) {
    toast.success("Reference submitted and verified successfully.");
    return;
  }

  toast.success("Reference submitted. It is awaiting admin verification.");
}

export function showReferenceSubmitErrorToast(message?: string) {
  toast.error(message?.trim() || "Could not submit reference. Please try again.");
}
