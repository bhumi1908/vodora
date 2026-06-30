import {
  isCandidateVisibility,
  type CandidateVisibility,
} from "@/lib/settings/candidate-visibility";

export const MAX_DEFAULT_COVER_LETTER_LENGTH = 10_000;

export function validateCandidateVisibility(
  value: unknown,
): string | null {
  if (typeof value !== "string" || !isCandidateVisibility(value)) {
    return "Choose a valid profile visibility option.";
  }

  return null;
}

export function validateDefaultCoverLetter(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return "Cover letter must be text.";
  }

  if (value.length > MAX_DEFAULT_COVER_LETTER_LENGTH) {
    return `Cover letter must be ${MAX_DEFAULT_COVER_LETTER_LENGTH.toLocaleString()} characters or fewer.`;
  }

  return null;
}

export type CandidateSettingsPayload = {
  visibility?: CandidateVisibility;
  defaultCoverLetter?: string | null;
};

export function validateCandidateSettingsPayload(
  body: CandidateSettingsPayload,
): string | null {
  if (body.visibility !== undefined) {
    const visibilityError = validateCandidateVisibility(body.visibility);

    if (visibilityError) {
      return visibilityError;
    }
  }

  if (body.defaultCoverLetter !== undefined) {
    const coverLetterError = validateDefaultCoverLetter(body.defaultCoverLetter);

    if (coverLetterError) {
      return coverLetterError;
    }
  }

  if (
    body.visibility === undefined &&
    body.defaultCoverLetter === undefined
  ) {
    return "No settings to update.";
  }

  return null;
}
