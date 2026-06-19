export const REMOTE_PREFERENCE_OPTIONS = [
  { value: "", label: "No preference" },
  { value: "remote", label: "Remote only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On-site only" },
  { value: "flexible", label: "Flexible" },
] as const;

export const HIRING_EXPERIENCE_LEVEL_OPTIONS = [
  { value: "0-3", label: "Entry level (0-3 years)" },
  { value: "4-7", label: "Mid level (4-7 years)" },
  { value: "8+", label: "Senior (8+ years)" },
] as const;

export const REMOTE_PREFERENCE_VALUES = REMOTE_PREFERENCE_OPTIONS.map(
  (option) => option.value,
).filter(Boolean);

export const HIRING_EXPERIENCE_LEVEL_VALUES =
  HIRING_EXPERIENCE_LEVEL_OPTIONS.map((option) => option.value);

export const COMPANY_INVITATION_ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
] as const;

export type RemotePreference = (typeof REMOTE_PREFERENCE_OPTIONS)[number]["value"];
export type CompanyInvitationRole =
  (typeof COMPANY_INVITATION_ROLE_OPTIONS)[number]["value"];
