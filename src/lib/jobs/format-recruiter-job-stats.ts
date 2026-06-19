import type { RecruiterJobStats } from "@/lib/jobs/recruiter-jobs.types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function formatRecruiterStatCount(value: number): string {
  return value.toLocaleString("en-AU");
}

export function formatRecruiterAvgTimeToHire(days: number | null): string {
  if (days === null) {
    return "—";
  }

  return `${days} day${days === 1 ? "" : "s"}`;
}

export function formatHiringFasterPercent(percent: number | null): string {
  if (percent === null) {
    return "—";
  }

  return `${percent}%`;
}

export function formatHoursSaved(hours: number): string {
  if (hours === 0) {
    return "0 hours";
  }

  if (hours === 1) {
    return "1 hour";
  }

  return `${hours.toLocaleString("en-AU")} hours`;
}

export function formatRecruiterJobStatsForDisplay(stats: RecruiterJobStats) {
  return {
    totalPlacements: formatRecruiterStatCount(stats.totalPlacements),
    activeRoles: formatRecruiterStatCount(stats.activeRoles),
    candidatesWorkedWith: formatRecruiterStatCount(stats.candidatesWorkedWith),
    avgTimeToHire: formatRecruiterAvgTimeToHire(stats.avgTimeToHireDays),
    hiringFasterPercent: formatHiringFasterPercent(stats.hiringFasterPercent),
    hoursSavedThisMonth: formatHoursSaved(stats.hoursSavedThisMonth),
  };
}

export function computeAvgTimeToHireDays(
  placements: Array<{ job_posting_id: string; updated_at: string }>,
  jobStartById: Map<string, string>,
): number | null {
  let totalDays = 0;
  let count = 0;

  for (const placement of placements) {
    const startAt = jobStartById.get(placement.job_posting_id);

    if (!startAt) {
      continue;
    }

    const days =
      (new Date(placement.updated_at).getTime() - new Date(startAt).getTime()) /
      MS_PER_DAY;

    if (days >= 0) {
      totalDays += days;
      count += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return Math.round(totalDays / count);
}
