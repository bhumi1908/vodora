import { toast } from "sonner";

import { RECRUITER_PROFILE_ROLES_PATH } from "@/lib/auth/routes";

export function showJobCreatedSuccessToast() {
  toast.success("Job created successfully!");
}

export function showJobAppliedSuccessToast(jobTitle?: string) {
  const label = jobTitle?.trim() ? ` for ${jobTitle.trim()}` : "";
  toast.success(`Job applied successfully${label}!`);
}

export function showJobApplyErrorToast(message?: string) {
  toast.error(message?.trim() || "Could not submit your application. Please try again.");
}

export function showNewJobApplicationToast(candidateName?: string, jobTitle?: string) {
  const who = candidateName?.trim() || "A candidate";
  const role = jobTitle?.trim() ? ` for ${jobTitle.trim()}` : "";

  toast.info(`${who} applied${role}.`, {
    action: {
      label: "View roles",
      onClick: () => {
        window.location.href = RECRUITER_PROFILE_ROLES_PATH;
      },
    },
  });
}
