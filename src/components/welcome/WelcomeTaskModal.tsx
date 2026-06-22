"use client";

import { CandidateProfileSectionModal } from "@/components/profile/edit/CandidateProfileSectionModal";
import type { CandidateProfileEditData } from "@/components/profile/edit/types";

export type WelcomeProfileTaskId =
  | "photo"
  | "experience"
  | "skills"
  | "documents";

type WelcomeTaskModalProps = {
  taskId: WelcomeProfileTaskId | null;
  initialProfile: CandidateProfileEditData;
  onClose: () => void;
  onSaved?: () => void;
};

export function WelcomeTaskModal({
  taskId,
  initialProfile,
  onClose,
  onSaved,
}: WelcomeTaskModalProps) {
  return (
    <CandidateProfileSectionModal
      sectionId={taskId}
      initialProfile={initialProfile}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
