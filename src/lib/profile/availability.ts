export const AVAILABILITY_STATUS_VALUES = [
  "not_looking",
  "open",
  "actively_looking",
  "available_now",
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUS_VALUES)[number];

export const AVAILABILITY_STATUS_OPTIONS = [
  { value: "not_looking", label: "Not looking" },
  { value: "open", label: "Open to opportunities" },
  { value: "actively_looking", label: "Actively looking" },
  { value: "available_now", label: "Available now" },
] as const;

export const AVAILABILITY_START_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "Immediately", label: "Immediately" },
  { value: "2 weeks", label: "2 weeks" },
  { value: "1 month", label: "1 month" },
  { value: "3 months", label: "3 months" },
] as const;

const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  not_looking: "Not looking",
  open: "Open to opportunities",
  actively_looking: "Actively looking",
  available_now: "Available now",
};

export function formatAvailabilityStatus(status: string): string {
  if (status in AVAILABILITY_STATUS_LABELS) {
    return AVAILABILITY_STATUS_LABELS[status as AvailabilityStatus];
  }

  return status.replaceAll("_", " ");
}

export function formatCandidateAvailability(
  availabilityStatus: string,
  availabilityStart: string | null | undefined,
  workTypes: string[] = [],
): string {
  const statusLabel = formatAvailabilityStatus(availabilityStatus);
  const startLabel = availabilityStart?.trim();

  if (startLabel) {
    return `${statusLabel} · ${startLabel}`;
  }

  if (workTypes.length > 0) {
    return `${statusLabel} · ${workTypes.join(", ")}`;
  }

  return statusLabel;
}

/** Short label for candidate list/grid cards: timing only when looking, status only when not. */
export function formatCandidateCardAvailability(
  availabilityStatus: string,
  availabilityStart: string | null | undefined,
): string {
  if (availabilityStatus === "not_looking") {
    return "Not looking";
  }

  const startLabel = availabilityStart?.trim();
  if (startLabel) {
    return startLabel;
  }

  if (availabilityStatus === "available_now") {
    return "Immediately";
  }

  return formatAvailabilityStatus(availabilityStatus);
}

export function validateAvailabilityStatus(value: string | undefined): string | null {
  const status = value?.trim() ?? "";

  if (!status) {
    return "Job search status is required.";
  }

  if (
    !AVAILABILITY_STATUS_VALUES.includes(status as AvailabilityStatus)
  ) {
    return "Please select a valid job search status.";
  }

  return null;
}

export function validateAvailabilityStart(value: string | undefined): string | null {
  const start = value?.trim() ?? "";

  if (!start) {
    return null;
  }

  if (start.length > 30) {
    return "Availability timing must be 30 characters or fewer.";
  }

  return null;
}
