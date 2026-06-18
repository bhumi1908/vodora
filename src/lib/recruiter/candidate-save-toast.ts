import { toast } from "sonner";

function formatCandidateLabel(name?: string): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "Candidate";
}

export function showCandidateSavedToast(candidateName?: string) {
  toast.success(`${formatCandidateLabel(candidateName)} added to your saved list.`);
}

export function showCandidateRemovedToast(candidateName?: string) {
  toast.success(`${formatCandidateLabel(candidateName)} removed from your saved list.`);
}

export function showCandidateSaveErrorToast() {
  toast.error("Could not update saved list. Please try again.");
}
