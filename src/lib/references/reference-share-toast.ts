import { toast } from "sonner";

export function showShareLinkCopiedToast() {
  toast.success("Share link copied to clipboard.");
}

export function showShareLinkCreatedToast() {
  toast.success("Share link created.");
}

export function showShareLinkRevokedToast() {
  toast.success("Share link revoked.");
}

export function showRecruiterAccessSharedToast(recruiterName?: string) {
  toast.success(
    recruiterName
      ? `References shared with ${recruiterName}.`
      : "References shared with recruiter.",
  );
}

export function showRecruiterAccessRevokedToast() {
  toast.success("Recruiter access revoked.");
}

export function showShareLinkErrorToast(message?: string) {
  toast.error(message ?? "Something went wrong with reference sharing.");
}

export function showShareLinkEmailedToast(recruiterName?: string) {
  const recipient = recruiterName?.trim() ? recruiterName.trim() : "the recruiter";

  toast.success(
    `Share link emailed to ${recipient}. It should arrive in less than a minute.`,
  );
}
