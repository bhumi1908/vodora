export const TRADITIONAL_HIRE_BASELINE_DAYS = 21;
export const HOURS_SAVED_PER_VERIFIED_APPLICATION = 5;
export const HOURS_SAVED_PER_SAVED_PROFILE = 2;

export function getCurrentMonthStartIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function computeHiringFasterPercent(
  avgTimeToHireDays: number | null,
): number | null {
  if (avgTimeToHireDays === null) {
    return null;
  }

  const percent = Math.round(
    ((TRADITIONAL_HIRE_BASELINE_DAYS - avgTimeToHireDays) /
      TRADITIONAL_HIRE_BASELINE_DAYS) *
      100,
  );

  return Math.max(0, Math.min(99, percent));
}

export function computeHoursSavedThisMonth(input: {
  verifiedApplicationsThisMonth: number;
  profilesSavedThisMonth: number;
}): number {
  return (
    input.verifiedApplicationsThisMonth * HOURS_SAVED_PER_VERIFIED_APPLICATION +
    input.profilesSavedThisMonth * HOURS_SAVED_PER_SAVED_PROFILE
  );
}

export function countVerifiedApplicationsThisMonth(
  applications: Array<{ applied_at: string; references_attached: boolean }>,
  monthStartIso: string,
): number {
  const monthStartMs = new Date(monthStartIso).getTime();

  return applications.filter((application) => {
    if (!application.references_attached) {
      return false;
    }

    const appliedAtMs = new Date(application.applied_at).getTime();

    return !Number.isNaN(appliedAtMs) && appliedAtMs >= monthStartMs;
  }).length;
}
