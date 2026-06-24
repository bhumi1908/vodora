import { DEFAULT_REFERENCE_GRANT_PERMISSIONS } from "@/lib/references/reference-grant-defaults";

export type ReferenceSharePermissions = {
  show_verification_status: boolean;
  show_ratings: boolean;
  show_employment_confirmation: boolean;
  show_written_comments: boolean;
  show_referee_contact: boolean;
};

export const REFERENCE_PERMISSION_OPTIONS: Array<{
  key: keyof ReferenceSharePermissions;
  label: string;
  description: string;
}> = [
  {
    key: "show_verification_status",
    label: "Verification status",
    description: "Show whether each reference is verified.",
  },
  {
    key: "show_ratings",
    label: "Reference ratings",
    description: "Include performance and recommendation scores.",
  },
  {
    key: "show_employment_confirmation",
    label: "Employment confirmation",
    description: "Include employment dates and confirmation details.",
  },
  {
    key: "show_written_comments",
    label: "Written comments",
    description: "Include written quotes and questionnaire answers.",
  },
  {
    key: "show_referee_contact",
    label: "Referee contact details",
    description: "Show referee email and phone number.",
  },
];

export const REFERENCE_EXPIRY_OPTIONS = [
  { value: 0, label: "Never expires" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
] as const;

export function normalizeReferenceSharePermissions(
  input?: Partial<ReferenceSharePermissions> | null,
): ReferenceSharePermissions {
  return {
    show_verification_status:
      input?.show_verification_status ??
      DEFAULT_REFERENCE_GRANT_PERMISSIONS.show_verification_status,
    show_ratings:
      input?.show_ratings ?? DEFAULT_REFERENCE_GRANT_PERMISSIONS.show_ratings,
    show_employment_confirmation:
      input?.show_employment_confirmation ??
      DEFAULT_REFERENCE_GRANT_PERMISSIONS.show_employment_confirmation,
    show_written_comments:
      input?.show_written_comments ??
      DEFAULT_REFERENCE_GRANT_PERMISSIONS.show_written_comments,
    show_referee_contact:
      input?.show_referee_contact ??
      DEFAULT_REFERENCE_GRANT_PERMISSIONS.show_referee_contact,
  };
}

export function resolveShareExpiresAt(
  expiresInDays: number | null | undefined,
): string | null {
  if (!expiresInDays || expiresInDays <= 0) {
    return null;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  return expiresAt.toISOString();
}
