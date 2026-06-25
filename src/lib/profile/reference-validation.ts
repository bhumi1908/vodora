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
import {
  WRITTEN_REFERENCE_ASSESSMENT,
  type WrittenAssessmentQuestionId,
  mapWrittenAssessmentToLegacyRatings,
} from "@/lib/references/written-reference-assessment";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ReferenceFieldErrors = FieldErrors<keyof RequestReferenceFormData>;

export type ReferenceResponseFieldErrors = FieldErrors<
  keyof ReferenceResponseFormData
> & {
  questionnaire?: Partial<Record<QuestionnaireQuestionId, string>>;
  writtenAssessment?: Partial<Record<WrittenAssessmentQuestionId, string>>;
};

export function hasReferenceResponseFieldErrors(
  errors: ReferenceResponseFieldErrors,
): boolean {
  const { questionnaire, writtenAssessment, ...fieldErrors } = errors;

  if (hasFieldErrors(fieldErrors)) {
    return true;
  }

  if (hasFieldErrors(questionnaire ?? {})) {
    return true;
  }

  return hasFieldErrors(writtenAssessment ?? {});
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
    errors.employmentConfirmed = "You must confirm that you worked with this candidate.";
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

  if (!input.signatureName?.trim()) {
    errors.signatureName = "Signature name is required.";
  }
}

function validateWrittenAssessmentAnswers(
  input: Partial<ReferenceResponseFormData>,
  errors: ReferenceResponseFieldErrors,
) {
  const writtenAssessmentErrors: Partial<
    Record<WrittenAssessmentQuestionId, string>
  > = {};

  for (const question of WRITTEN_REFERENCE_ASSESSMENT) {
    const value = input.writtenAssessmentAnswers?.[question.id]?.trim() ?? "";

    if (question.required && !value) {
      writtenAssessmentErrors[question.id] = "This answer is required.";
      continue;
    }

    if (question.type === "select" && value) {
      const isValid = question.options.some((option) => option.value === value);
      if (!isValid) {
        writtenAssessmentErrors[question.id] = "Choose a valid option.";
      }
    }
  }

  if (Object.keys(writtenAssessmentErrors).length > 0) {
    errors.writtenAssessment = writtenAssessmentErrors;
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
    validateWrittenAssessmentAnswers(input, errors);
  }

  return errors;
}

export type ReferenceRequestInsertContext = {
  candidateId: string;
  userId: string;
  recruiterId?: string;
};

export function mapReferenceRequestToInsert(
  input: RequestReferenceFormData,
  context: ReferenceRequestInsertContext,
) {
  const isRecruiterRequest = Boolean(context.recruiterId);

  return {
    candidate_id: context.candidateId,
    requested_by_type: isRecruiterRequest
      ? ("recruiter" as const)
      : ("candidate" as const),
    requested_by_user_id: context.userId,
    requested_by_recruiter_id: isRecruiterRequest
      ? context.recruiterId!
      : null,
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
  const legacyRatings = !isQuestionnaire
    ? mapWrittenAssessmentToLegacyRatings(input.writtenAssessmentAnswers)
    : null;

  return {
    reference_request_id: context.referenceRequestId,
    submitted_by_user_id: context.userId,
    employment_confirmed: input.employmentConfirmed,
    position_held: input.positionHeld.trim(),
    employment_dates_confirmed: input.employmentDatesConfirmed,
    performance_rating: isQuestionnaire
      ? null
      : legacyRatings?.performanceRating ?? null,
    reliability_rating: isQuestionnaire
      ? null
      : legacyRatings?.reliabilityRating ?? null,
    teamwork_rating: isQuestionnaire
      ? null
      : legacyRatings?.teamworkRating ?? null,
    leadership_rating: isQuestionnaire
      ? null
      : legacyRatings?.leadershipRating ?? null,
    rehire_recommendation: isQuestionnaire
      ? input.questionnaireAnswers.would_rehire === "yes"
        ? true
        : input.questionnaireAnswers.would_rehire === "no"
          ? false
          : null
      : legacyRatings?.rehireRecommendation ?? null,
    written_comments: isQuestionnaire
      ? input.questionnaireAnswers.additional_comments.trim() || null
      : input.writtenAssessmentAnswers.greatest_strengths.trim() || null,
    questionnaire_responses: isQuestionnaire
      ? input.questionnaireAnswers
      : input.writtenAssessmentAnswers,
    attestation_confirmed: true,
    signature_name: input.signatureName.trim(),
    signature_date: input.signatureDate.trim() || null,
    allow_profile_creation: input.allowProfileCreation,
    referee_linkedin: input.refereeLinkedIn.trim() || null,
  };
}
