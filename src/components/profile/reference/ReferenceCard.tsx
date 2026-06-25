"use client";

import { Building2, CheckCircle2, Mail, Phone, Star, Trash2 } from "lucide-react";

import {
  getReferenceStatusLabel,
  getRefereeInitials,
  normalizeReferenceType,
} from "@/components/profile/reference/types";
import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";
import { formatDateRange } from "@/lib/profile/format";
import {
  formatQuestionnaireAnswerValue,
  REFERENCE_QUESTIONNAIRE,
} from "@/lib/references/reference-questionnaire";
import {
  formatWrittenAssessmentAnswerValue,
  getWrittenAssessmentQuestion,
  WRITTEN_REFERENCE_ASSESSMENT,
  WRITTEN_REFERENCE_SUMMARY_FIELDS,
} from "@/lib/references/written-reference-assessment";

type ReferenceCardProps = {
  reference: CandidateReferenceItem;
  isOwnProfile: boolean;
  showRefereeContact?: boolean;
  showVerificationStatus?: boolean;
  showRatings?: boolean;
  showEmploymentConfirmation?: boolean;
  showWrittenComments?: boolean;
  onCancel?: (referenceId: string) => void;
  isCancelling?: boolean;
};

function formatReferenceDate(reference: CandidateReferenceItem): string {
  const dateValue = reference.verifiedAt ?? reference.submittedAt ?? reference.createdAt;

  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatEmploymentPeriod(reference: CandidateReferenceItem): string | null {
  if (!reference.employmentStart && !reference.employmentEnd) {
    return null;
  }

  return formatDateRange(reference.employmentStart, reference.employmentEnd);
}

function statusClasses(status: string): string {
  switch (status) {
    case "verified":
      return "bg-green-50 text-green-700";
    case "submitted":
      return "bg-amber-50 text-amber-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function ReadOnlyStarRating({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-xs text-gray-500">{label}</span>
      <div
        className="flex shrink-0 items-center gap-0.5"
        aria-label={`${label}: ${value} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function hasReferenceRatings(reference: CandidateReferenceItem): boolean {
  return (
    reference.performanceRating != null ||
    reference.reliabilityRating != null ||
    reference.teamworkRating != null ||
    reference.leadershipRating != null ||
    reference.rehireRecommendation != null
  );
}

export function ReferenceCard({
  reference,
  isOwnProfile,
  showRefereeContact = isOwnProfile,
  showVerificationStatus = true,
  showRatings = true,
  showEmploymentConfirmation = true,
  showWrittenComments = true,
  onCancel,
  isCancelling = false,
}: ReferenceCardProps) {
  const employmentPeriod = showEmploymentConfirmation
    ? formatEmploymentPeriod(reference)
    : null;
  const isQuestionnaire =
    normalizeReferenceType(reference.referenceType) === "questionnaire";
  const hasWrittenAssessment = Boolean(reference.writtenAssessmentResponses);
  const showWrittenQuote =
    showWrittenComments &&
    reference.status === "verified" &&
    !isQuestionnaire &&
    !hasWrittenAssessment &&
    Boolean(reference.writtenComments);
  const showWrittenAssessmentSummary =
    showWrittenComments &&
    reference.status === "verified" &&
    !isQuestionnaire &&
    hasWrittenAssessment &&
    Boolean(reference.writtenAssessmentResponses);
  const showQuestionnaire =
    showWrittenComments &&
    reference.status === "verified" &&
    isQuestionnaire &&
    Boolean(reference.questionnaireResponses);
  const showRatingsSection =
    showRatings &&
    reference.status === "verified" &&
    !hasWrittenAssessment &&
    hasReferenceRatings(reference);
  const showEmploymentDetails =
    showEmploymentConfirmation &&
    (employmentPeriod ||
      reference.employmentConfirmed ||
      reference.employmentDatesConfirmed);

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-semibold text-blue-700 sm:h-14 sm:w-14 sm:text-lg">
          {getRefereeInitials(reference.refereeName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                {reference.refereeName}
              </h3>
              <p className="text-sm font-medium text-gray-700">
                {reference.refereeTitle}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {reference.relationshipLabel}
                {formatReferenceDate(reference)
                  ? ` · ${formatReferenceDate(reference)}`
                  : ""}
              </p>
              {showEmploymentDetails ? (
                <div className="mt-2 flex flex-col gap-1">
                  {employmentPeriod ? (
                    <p className="text-xs text-gray-400">{employmentPeriod}</p>
                  ) : null}
                  {reference.employmentConfirmed ? (
                    <p className="flex items-center gap-1 text-xs text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Employment confirmed
                    </p>
                  ) : null}
                  {reference.employmentDatesConfirmed ? (
                    <p className="flex items-center gap-1 text-xs text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Employment dates confirmed
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start">
              {showVerificationStatus ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(reference.status)}`}
                >
                  {getReferenceStatusLabel(reference.status)}
                </span>
              ) : null}
              {isOwnProfile && reference.status === "pending" && onCancel ? (
                <button
                  type="button"
                  onClick={() => onCancel(reference.id)}
                  disabled={isCancelling}
                  aria-label="Cancel reference request"
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {showWrittenQuote ? (
            <blockquote className="mt-4 border-l-4 border-blue-200 pl-4 text-sm italic leading-relaxed text-gray-700">
              &ldquo;{reference.writtenComments}&rdquo;
            </blockquote>
          ) : null}

          {showWrittenAssessmentSummary && reference.writtenAssessmentResponses ? (
            <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
              {reference.writtenComments ? (
                <blockquote className="border-l-4 border-blue-200 pl-4 text-sm italic leading-relaxed text-gray-700">
                  &ldquo;{reference.writtenComments}&rdquo;
                </blockquote>
              ) : null}

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Referee summary
                </p>
                <dl className="mt-3 space-y-2">
                  {WRITTEN_REFERENCE_SUMMARY_FIELDS.map((field) => {
                    const question = getWrittenAssessmentQuestion(field.id);
                    const rawValue =
                      reference.writtenAssessmentResponses?.[field.id] ?? "";
                    const formatted = question
                      ? formatWrittenAssessmentAnswerValue(question, rawValue)
                      : rawValue;

                    if (!formatted) {
                      return null;
                    }

                    return (
                      <div
                        key={field.id}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                      >
                        <dt className="text-xs text-gray-500">{field.label}</dt>
                        <dd className="text-sm font-medium text-gray-800">
                          {formatted}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <dl className="space-y-3">
                {WRITTEN_REFERENCE_ASSESSMENT.filter(
                  (question) =>
                    question.id !== "greatest_strengths" &&
                    !WRITTEN_REFERENCE_SUMMARY_FIELDS.some(
                      (field) => field.id === question.id,
                    ),
                ).map((question) => {
                  const rawValue =
                    reference.writtenAssessmentResponses?.[question.id] ?? "";
                  const formatted = formatWrittenAssessmentAnswerValue(
                    question,
                    rawValue,
                  );

                  if (!formatted) {
                    return null;
                  }

                  return (
                    <div key={question.id}>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {question.label}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700">
                        {question.type === "textarea" ? (
                          <span className="whitespace-pre-wrap">{formatted}</span>
                        ) : (
                          formatted
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ) : null}

          {showRatingsSection ? (
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Reference ratings
              </p>
              <div className="space-y-2">
                {reference.performanceRating != null ? (
                  <ReadOnlyStarRating
                    label="Performance"
                    value={reference.performanceRating}
                  />
                ) : null}
                {reference.reliabilityRating != null ? (
                  <ReadOnlyStarRating
                    label="Reliability"
                    value={reference.reliabilityRating}
                  />
                ) : null}
                {reference.teamworkRating != null ? (
                  <ReadOnlyStarRating
                    label="Teamwork"
                    value={reference.teamworkRating}
                  />
                ) : null}
                {reference.leadershipRating != null ? (
                  <ReadOnlyStarRating
                    label="Leadership"
                    value={reference.leadershipRating}
                  />
                ) : null}
                {reference.rehireRecommendation != null ? (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="text-xs text-gray-500">
                      Rehire recommendation
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        reference.rehireRecommendation
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {reference.rehireRecommendation ? "Yes" : "No"}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {showQuestionnaire && reference.questionnaireResponses ? (
            <dl className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {REFERENCE_QUESTIONNAIRE.map((question) => {
                const rawValue = reference.questionnaireResponses?.[question.id];
                const formatted = formatQuestionnaireAnswerValue(
                  question,
                  rawValue ?? "",
                );

                if (!formatted) {
                  return null;
                }

                return (
                  <div key={question.id}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {question.label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-700">
                      {question.type === "textarea" ? (
                        <span className="whitespace-pre-wrap">{formatted}</span>
                      ) : (
                        formatted
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : null}

          {reference.status === "submitted" ? (
            <p className="mt-4 text-sm text-amber-700">
              Submitted and awaiting admin verification.
            </p>
          ) : null}

          {reference.status === "pending" ? (
            <p className="mt-4 text-sm text-gray-500">
              Waiting for the referee to complete the reference form.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-4">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="wrap-break-word">{reference.refereeCompany}</span>
            </span>
            {showRefereeContact && reference.refereeEmail ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="break-all">{reference.refereeEmail}</span>
              </span>
            ) : null}
            {showRefereeContact && reference.refereePhone ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="wrap-break-word">{reference.refereePhone}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
