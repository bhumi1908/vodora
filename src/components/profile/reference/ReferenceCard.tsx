"use client";

import { Building2, Mail, Phone, Trash2 } from "lucide-react";

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

type ReferenceCardProps = {
  reference: CandidateReferenceItem;
  isOwnProfile: boolean;
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

export function ReferenceCard({
  reference,
  isOwnProfile,
  onCancel,
  isCancelling = false,
}: ReferenceCardProps) {
  const employmentPeriod = formatEmploymentPeriod(reference);
  const isQuestionnaire =
    normalizeReferenceType(reference.referenceType) === "questionnaire";
  const showWrittenQuote =
    reference.status === "verified" &&
    !isQuestionnaire &&
    Boolean(reference.writtenComments);
  const showQuestionnaire =
    reference.status === "verified" &&
    isQuestionnaire &&
    Boolean(reference.questionnaireResponses);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
          {getRefereeInitials(reference.refereeName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
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
              {employmentPeriod ? (
                <p className="mt-1 text-xs text-gray-400">{employmentPeriod}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(reference.status)}`}
              >
                {getReferenceStatusLabel(reference.status)}
              </span>
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

          <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              {reference.refereeCompany}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-gray-400" />
              {reference.refereeEmail}
            </span>
            {reference.refereePhone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-gray-400" />
                {reference.refereePhone}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
