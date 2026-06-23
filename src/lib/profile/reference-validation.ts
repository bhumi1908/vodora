import { type FieldErrors, firstFieldError, hasFieldErrors } from "@/lib/form/field-errors";
import {
  isMonthRangeInvalid,
  validateMonthField,
} from "@/lib/profile/validation";

import type {
  ReferenceResponseFormData,
  ReferenceType,
  RequestReferenceFormData,
} from "@/components/profile/reference/types";
import { normalizeReferenceType } from "@/components/profile/reference/types";
import {
  REFERENCE_QUESTIONNAIRE,
  type QuestionnaireQuestionId,
} from "@/lib/references/reference-questionnaire";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ReferenceFieldErrors = FieldErrors<keyof RequestReferenceFormData>;

export type ReferenceResponseFieldErrors = FieldErrors<
  keyof ReferenceResponseFormData
> & {
  questionnaire?: Partial<Record<QuestionnaireQuestionId, string>>;
};

export function hasReferenceResponseFieldErrors(
  errors: ReferenceResponseFieldErrors,
): boolean {
  const { questionnaire, ...fieldErrors } = errors;

  if (hasFieldErrors(fieldErrors)) {
    return true;
  }

  return hasFieldErrors(questionnaire ?? {});
}

function parseOptionalMonth(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // HTML month inputs return YYYY-MM; PostgreSQL date columns need YYYY-MM-DD.
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return trimmed;
}

export function getReferenceFieldErrors(
  input: Partial<RequestReferenceFormData>,
): ReferenceFieldErrors {
  const errors: ReferenceFieldErrors = {};

  if (!input.name?.trim()) {
    errors.name = "Name is required.";
  }

  if (!input.title?.trim()) {
    errors.title = "Title is required.";
  }

  if (!input.company?.trim()) {
    errors.company = "Company is required.";
  }

  if (!input.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.relationship) {
    errors.relationship = "Relationship is required.";
  }

  if (!input.referenceType) {
    errors.referenceType = "Reference type is required.";
  }

  const employmentStartError = validateMonthField(
    input.employmentStart ?? "",
    "Employment start",
  );

  if (employmentStartError) {
    errors.employmentStart = employmentStartError;
  }

  const employmentEndError = validateMonthField(
    input.employmentEnd ?? "",
    "Employment end",
  );

  if (employmentEndError) {
    errors.employmentEnd = employmentEndError;
  } else if (
    input.employmentStart?.trim() &&
    input.employmentEnd?.trim() &&
    isMonthRangeInvalid(input.employmentStart, input.employmentEnd)
  ) {
    errors.employmentEnd = "End date must be on or after the start date.";
  }

  return errors;
}

export function validateReferenceRequest(
  input: Partial<RequestReferenceFormData>,
): string | null {
  return firstFieldError(getReferenceFieldErrors(input));
}

function validateSharedEmploymentFields(
  input: Partial<ReferenceResponseFormData>,
  errors: ReferenceResponseFieldErrors,
) {
  if (!input.employmentConfirmed) {
    errors.employmentConfirmed = "Employment confirmation is required.";
  }

  if (!input.positionHeld?.trim()) {
    errors.positionHeld = "Position held is required.";
  }

  if (!input.employmentDatesConfirmed) {
    errors.employmentDatesConfirmed = "Employment dates confirmation is required.";
  }

  if (!input.attestationConfirmed) {
    errors.attestationConfirmed = "You must confirm this information is accurate.";
  }
}

function validateWrittenRatings(
  input: Partial<ReferenceResponseFormData>,
  errors: ReferenceResponseFieldErrors,
) {
  for (const field of [
    "performanceRating",
    "reliabilityRating",
    "teamworkRating",
    "leadershipRating",
  ] as const) {
    const value = input[field];
    if (!value) {
      errors[field] = "Rating is required.";
    } else if (!/^[1-5]$/.test(value)) {
      errors[field] = "Choose a rating from 1 to 5.";
    }
  }

  if (!input.rehireRecommendation) {
    errors.rehireRecommendation = "Rehire recommendation is required.";
  }
}

function validateQuestionnaireAnswers(
  input: Partial<ReferenceResponseFormData>,
  errors: ReferenceResponseFieldErrors,
) {
  const questionnaireErrors: Partial<Record<QuestionnaireQuestionId, string>> =
    {};

  for (const question of REFERENCE_QUESTIONNAIRE) {
    const value = input.questionnaireAnswers?.[question.id]?.trim() ?? "";

    if (question.required && !value) {
      questionnaireErrors[question.id] = "This answer is required.";
      continue;
    }

    if (question.type === "rating" && value && !/^[1-5]$/.test(value)) {
      questionnaireErrors[question.id] = "Choose a rating from 1 to 5.";
    }

    if (question.type === "yes_no" && value && !/^(yes|no)$/.test(value)) {
      questionnaireErrors[question.id] = "Choose Yes or No.";
    }
  }

  if (Object.keys(questionnaireErrors).length > 0) {
    errors.questionnaire = questionnaireErrors;
  }
}

export function getReferenceResponseFieldErrors(
  input: Partial<ReferenceResponseFormData>,
  referenceType: ReferenceType,
): ReferenceResponseFieldErrors {
  const errors: ReferenceResponseFieldErrors = {};

  validateSharedEmploymentFields(input, errors);

  if (referenceType === "questionnaire") {
    validateQuestionnaireAnswers(input, errors);
  } else {
    validateWrittenRatings(input, errors);
  }

  return errors;
}

export function mapReferenceRequestToInsert(
  input: RequestReferenceFormData,
  context: {
    candidateId: string;
    userId: string;
  },
) {
  return {
    candidate_id: context.candidateId,
    requested_by_type: "candidate" as const,
    requested_by_user_id: context.userId,
    requested_by_recruiter_id: null,
    referee_name: input.name.trim(),
    referee_title: input.title.trim(),
    referee_company: input.company.trim(),
    referee_email: input.email.trim().toLowerCase(),
    referee_phone: input.phone.trim() || null,
    relationship: input.relationship,
    employment_start: parseOptionalMonth(input.employmentStart),
    employment_end: parseOptionalMonth(input.employmentEnd),
    reference_type: input.referenceType,
    candidate_message: input.message.trim() || null,
    require_company_email: input.requireCompanyEmail,
    employment_history_id: input.employmentHistoryId.trim() || null,
  };
}

export function mapReferenceResponseToInsert(
  input: ReferenceResponseFormData,
  context: {
    referenceRequestId: string;
    userId: string;
    referenceType: ReferenceType;
  },
) {
  const isQuestionnaire = context.referenceType === "questionnaire";

  return {
    reference_request_id: context.referenceRequestId,
    submitted_by_user_id: context.userId,
    employment_confirmed: input.employmentConfirmed,
    position_held: input.positionHeld.trim(),
    employment_dates_confirmed: input.employmentDatesConfirmed,
    performance_rating:
      !isQuestionnaire && input.performanceRating
        ? Number(input.performanceRating)
        : null,
    reliability_rating:
      !isQuestionnaire && input.reliabilityRating
        ? Number(input.reliabilityRating)
        : null,
    teamwork_rating:
      !isQuestionnaire && input.teamworkRating
        ? Number(input.teamworkRating)
        : null,
    leadership_rating:
      !isQuestionnaire && input.leadershipRating
        ? Number(input.leadershipRating)
        : null,
    rehire_recommendation: isQuestionnaire
      ? input.questionnaireAnswers.would_rehire === "yes"
        ? true
        : input.questionnaireAnswers.would_rehire === "no"
          ? false
          : null
      : input.rehireRecommendation === "yes"
        ? true
        : input.rehireRecommendation === "no"
          ? false
          : null,
    written_comments: isQuestionnaire
      ? input.questionnaireAnswers.additional_comments.trim() || null
      : input.writtenComments.trim() || null,
    questionnaire_responses: isQuestionnaire ? input.questionnaireAnswers : null,
    attestation_confirmed: true,
  };
}
