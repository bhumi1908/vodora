export function formatLocation(
  city: string | null | undefined,
  country: string | null | undefined,
): string | null {
  const parts = [city?.trim(), country?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function formatMonthYear(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent = false,
): string {
  const start = startDate ? formatMonthYear(startDate) : "Unknown";
  const end = isCurrent || !endDate ? "Present" : formatMonthYear(endDate);
  return `${start} - ${end}`;
}

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  const combined = `${first}${last}`.trim();
  return combined.slice(0, 2).toUpperCase() || "??";
}

export function formatWebsiteLabel(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function formatWebsiteHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function formatDocumentType(type: string): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
