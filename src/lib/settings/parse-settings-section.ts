export const SETTINGS_SECTION_IDS = [
  "profile-visibility",
  "account-security",
  "team-invitations",
  "default-cover-letter",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_SECTION_IDS.includes(value as SettingsSectionId);
}

export function parseSettingsSection(
  value: string | null | undefined,
): SettingsSectionId | null {
  if (!value) {
    return null;
  }

  return isSettingsSectionId(value) ? value : null;
}
