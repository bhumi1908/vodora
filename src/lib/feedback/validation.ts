import { type FieldErrors, firstFieldError } from "@/lib/form/field-errors";
import { getEmailFormatError } from "@/lib/email/validate-email";

export const FEEDBACK_ROLES = [
  "Candidate",
  "Recruiter",
  "Hiring Manager",
  "Staffing Agency",
  "Just browsing",
] as const;

export const FEEDBACK_TYPES = [
  "working",
  "not-working",
  "needs-improvement",
  "new-feature",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export type FeedbackPayload = {
  role: string;
  overallRating: number;
  feedbackType: FeedbackType;
  selectedFeature?: string;
  details: string;
  newFeatureTitle?: string;
  newFeatureDesc?: string;
  email?: string;
  canContact: boolean;
};

export type FeedbackFieldErrors = FieldErrors<
  "role" | "overallRating" | "feedbackType" | "details" | "email"
>;

export function getFeedbackFieldErrors(
  input: Partial<FeedbackPayload>,
): FeedbackFieldErrors {
  const errors: FeedbackFieldErrors = {};

  if (!input.role?.trim()) {
    errors.role = "Please select who you are on Vodora.";
  } else if (
    !FEEDBACK_ROLES.includes(
      input.role.trim() as (typeof FEEDBACK_ROLES)[number],
    )
  ) {
    errors.role = "Please select a valid role.";
  }

  if (
    typeof input.overallRating !== "number" ||
    input.overallRating < 1 ||
    input.overallRating > 5
  ) {
    errors.overallRating = "Please provide an overall rating.";
  }

  if (!input.feedbackType) {
    errors.feedbackType = "Please select a feedback type.";
  } else if (!FEEDBACK_TYPES.includes(input.feedbackType)) {
    errors.feedbackType = "Please select a valid feedback type.";
  }

  if (!input.details?.trim()) {
    errors.details = "Please share more details.";
  } else if (input.details.trim().length < 10) {
    errors.details = "Please enter at least 10 characters.";
  }

  if (input.canContact) {
    if (!input.email?.trim()) {
      errors.email = "Email is required if we can contact you.";
    } else {
      const formatError = getEmailFormatError(input.email);

      if (formatError) {
        errors.email = formatError;
      }
    }
  }

  return errors;
}

export function validateFeedback(
  input: Partial<FeedbackPayload>,
): string | null {
  return firstFieldError(getFeedbackFieldErrors(input));
}
