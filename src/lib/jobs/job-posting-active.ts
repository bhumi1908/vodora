const DEFAULT_JOB_POSTING_DURATION_DAYS = 30;

export function isJobPostingActive(
  status: string,
  closesAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (status !== "published") {
    return false;
  }

  if (!closesAt) {
    return true;
  }

  const closesAtDate = new Date(closesAt);

  if (Number.isNaN(closesAtDate.getTime())) {
    return true;
  }

  return closesAtDate > now;
}

export function isJobPostingExpired(
  status: string,
  closesAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  return status === "published" && !isJobPostingActive(status, closesAt, now);
}

export function computeDefaultClosesAt(
  publishedAt: Date = new Date(),
  durationDays = DEFAULT_JOB_POSTING_DURATION_DAYS,
): string {
  const closesAt = new Date(publishedAt);
  closesAt.setDate(closesAt.getDate() + durationDays);
  return closesAt.toISOString();
}

export { DEFAULT_JOB_POSTING_DURATION_DAYS };
