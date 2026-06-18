export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "0-3", label: "Entry level (0-3 years)" },
  { value: "4-7", label: "Mid level (4-7 years)" },
  { value: "8+", label: "Senior (8+ years)" },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVEL_OPTIONS)[number]["value"];

const EXPERIENCE_LEVEL_VALUES = new Set<string>(
  EXPERIENCE_LEVEL_OPTIONS.map((option) => option.value).filter(Boolean),
);

export function formatExperienceLevel(level: string | null | undefined): string {
  const trimmed = level?.trim() ?? "";

  if (!trimmed) {
    return "Not specified";
  }

  const match = EXPERIENCE_LEVEL_OPTIONS.find((option) => option.value === trimmed);
  return match?.label ?? trimmed;
}

export function validateExperienceLevel(value: string | undefined): string | null {
  const level = value?.trim() ?? "";

  if (!level) {
    return null;
  }

  if (!EXPERIENCE_LEVEL_VALUES.has(level)) {
    return "Please select a valid experience level.";
  }

  return null;
}

export function validateTotalYearsExperience(
  value: string | undefined,
  maxYears: number,
): string | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return "Total years of experience must be a valid number.";
  }

  if (parsed > maxYears) {
    return `Total years of experience cannot exceed ${maxYears}.`;
  }

  return null;
}
