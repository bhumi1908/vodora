export const DEFAULT_REFERENCE_GRANT_PERMISSIONS = {
  show_verification_status: true,
  show_ratings: true,
  show_employment_confirmation: true,
  show_written_comments: true,
  show_referee_contact: false,
} as const;

export type ReferenceShareType = "full_passport" | "selected_references";

export type JobApplyReferenceOption = {
  id: string;
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
};
