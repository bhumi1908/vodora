import { toast } from "sonner";

import { CANDIDATE_SECTION_COPY } from "@/components/profile/edit/profile-section-content";
import type { ProfileSectionId } from "@/components/profile/edit/types";
import { formatDocumentType } from "@/lib/profile/format";

export function showProfileSectionSavedToast(sectionId: ProfileSectionId) {
  const label = CANDIDATE_SECTION_COPY[sectionId].label;
  toast.success(`${label} saved successfully.`);
}

export function showProfileSectionSaveErrorToast(
  sectionId: ProfileSectionId,
  message?: string,
) {
  const label = CANDIDATE_SECTION_COPY[sectionId].label.toLowerCase();
  toast.error(
    message?.trim() || `Could not save ${label}. Please try again.`,
  );
}

export function showProfilePhotoSavedToast() {
  toast.success("Profile photo updated successfully.");
}

export function showProfilePhotoSaveErrorToast(message?: string) {
  toast.error(
    message?.trim() || "Could not upload profile photo. Please try again.",
  );
}

export function showProfileDocumentUploadedToast(documentType: string) {
  toast.success(`${formatDocumentType(documentType)} uploaded successfully.`);
}

export function showProfileDocumentDeletedToast() {
  toast.success("Document removed successfully.");
}

export function showProfileDocumentSaveErrorToast(message?: string) {
  toast.error(
    message?.trim() || "Could not update documents. Please try again.",
  );
}
