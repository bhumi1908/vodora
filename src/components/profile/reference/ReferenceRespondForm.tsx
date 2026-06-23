"use client";

import { useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { ReferenceQuestionnaireFields } from "@/components/profile/reference/ReferenceQuestionnaireFields";
import {
  createEmptyReferenceResponse,
  normalizeReferenceType,
  type ReferenceResponseFormData,
} from "@/components/profile/reference/types";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { formatDateRange } from "@/lib/profile/format";
import {
  getReferenceResponseFieldErrors,
  hasReferenceResponseFieldErrors,
  type ReferenceResponseFieldErrors,
} from "@/lib/profile/reference-validation";
import { REFERENCE_RATING_OPTIONS } from "@/lib/references/reference-questionnaire";
import type { ReferenceInvitationDetails } from "@/lib/references/fetch-reference-invitation";
import {
  showReferenceSubmitErrorToast,
  showReferenceSubmitSuccessToast,
} from "@/lib/references/reference-toast";

type ReferenceRespondFormProps = {
  invitation: ReferenceInvitationDetails;
  token: string;
  onSubmitted: (status: "verified" | "submitted") => void;
};

export function ReferenceRespondForm({
  invitation,
  token,
  onSubmitted,
}: ReferenceRespondFormProps) {
  const [form, setForm] = useState(createEmptyReferenceResponse);
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof ReferenceResponseFieldErrors>();
  const [questionnaireErrors, setQuestionnaireErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const referenceType = normalizeReferenceType(invitation.referenceType);
  const isQuestionnaire = referenceType === "questionnaire";

  const employmentPeriod = formatDateRange(
    invitation.employmentStart,
    invitation.employmentEnd,
  );
  const hasEmploymentDates =
    Boolean(invitation.employmentStart) || Boolean(invitation.employmentEnd);

  function updateField<K extends keyof ReferenceResponseFormData>(
    field: K,
    value: ReferenceResponseFormData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    clearField(field);
    setError("");
  }

  function updateQuestionnaireAnswer(questionId: string, value: string) {
    setForm((current) => ({
      ...current,
      questionnaireAnswers: {
        ...current.questionnaireAnswers,
        [questionId]: value,
      },
    }));
    setQuestionnaireErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    setError("");
  }

  async function handleSubmit() {
    const fieldErrors = getReferenceResponseFieldErrors(form, referenceType);

    if (hasReferenceResponseFieldErrors(fieldErrors)) {
      const { questionnaire, ...rest } = fieldErrors;
      setErrors(rest);
      setQuestionnaireErrors(questionnaire ?? {});
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reference/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, response: form }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        fieldErrors?: ReferenceResponseFieldErrors;
        status?: "verified" | "submitted";
      };

      if (!response.ok || !result.success) {
        if (result.fieldErrors) {
          const { questionnaire, ...rest } = result.fieldErrors;
          setErrors(rest);
          setQuestionnaireErrors(questionnaire ?? {});
        }

        const message = result.error ?? "Unable to submit reference.";
        setError(message);
        showReferenceSubmitErrorToast(message);
        return;
      }

      showReferenceSubmitSuccessToast(result.status === "verified");
      onSubmitted(result.status ?? "submitted");
    } catch {
      const message = "Unable to submit reference. Please try again.";
      setError(message);
      showReferenceSubmitErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
      className="space-y-6"
    >
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">Reference for {invitation.candidateName}</p>
        <p className="mt-1 text-blue-800">
          You were listed as their {invitation.relationshipLabel.toLowerCase()} at{" "}
          {invitation.refereeCompany}.
        </p>
        <p className="mt-2 text-blue-800">
          Reference type:{" "}
          <strong>
            {isQuestionnaire ? "Structured questionnaire" : "Written reference"}
          </strong>
        </p>
        {invitation.candidateMessage ? (
          <p className="mt-3 border-t border-blue-100 pt-3 text-blue-800">
            &ldquo;{invitation.candidateMessage}&rdquo;
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Employment confirmation</p>
          <label className="mt-2 flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.employmentConfirmed}
              onChange={(event) =>
                updateField("employmentConfirmed", event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">
              I confirm {invitation.candidateName} was employed in the role described.
            </span>
          </label>
          {errors.employmentConfirmed ? (
            <p className="mt-1 text-sm text-red-600">{errors.employmentConfirmed}</p>
          ) : null}
        </div>

        <FormField
          id="position-held"
          label="Position held"
          required
          value={form.positionHeld}
          onChange={(event) => updateField("positionHeld", event.target.value)}
          placeholder="e.g. Senior Software Engineer"
          error={errors.positionHeld}
        />

        <div>
          <p className="text-sm font-medium text-gray-900">Employment dates</p>
          {hasEmploymentDates ? (
            <p className="mt-1 text-sm text-gray-600">{employmentPeriod}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              No employment dates were provided by the candidate.
            </p>
          )}
          <label className="mt-3 flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.employmentDatesConfirmed}
              onChange={(event) =>
                updateField("employmentDatesConfirmed", event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded text-blue-600"
            />
            <span className="text-sm text-gray-700">
              {hasEmploymentDates
                ? "I confirm the employment dates shown above are accurate."
                : "I confirm the employment dates for this role are accurate."}
            </span>
          </label>
          {errors.employmentDatesConfirmed ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.employmentDatesConfirmed}
            </p>
          ) : null}
        </div>
      </div>

      {isQuestionnaire ? (
        <ReferenceQuestionnaireFields
          answers={form.questionnaireAnswers}
          errors={questionnaireErrors}
          onAnswerChange={updateQuestionnaireAnswer}
        />
      ) : (
        <>
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-900">Performance ratings</p>
            <AuthFormGrid>
              <FormSelect
                id="performance-rating"
                label="Performance"
                required
                value={form.performanceRating}
                onChange={(event) =>
                  updateField("performanceRating", event.target.value)
                }
                placeholder="Select rating"
                options={[...REFERENCE_RATING_OPTIONS]}
                error={errors.performanceRating}
              />
              <FormSelect
                id="reliability-rating"
                label="Reliability"
                required
                value={form.reliabilityRating}
                onChange={(event) =>
                  updateField("reliabilityRating", event.target.value)
                }
                placeholder="Select rating"
                options={[...REFERENCE_RATING_OPTIONS]}
                error={errors.reliabilityRating}
              />
            </AuthFormGrid>
            <AuthFormGrid>
              <FormSelect
                id="teamwork-rating"
                label="Teamwork"
                required
                value={form.teamworkRating}
                onChange={(event) =>
                  updateField("teamworkRating", event.target.value)
                }
                placeholder="Select rating"
                options={[...REFERENCE_RATING_OPTIONS]}
                error={errors.teamworkRating}
              />
              <FormSelect
                id="leadership-rating"
                label="Leadership"
                required
                value={form.leadershipRating}
                onChange={(event) =>
                  updateField("leadershipRating", event.target.value)
                }
                placeholder="Select rating"
                options={[...REFERENCE_RATING_OPTIONS]}
                error={errors.leadershipRating}
              />
            </AuthFormGrid>
            <FormSelect
              id="rehire-recommendation"
              label="Rehire recommendation"
              required
              value={form.rehireRecommendation}
              onChange={(event) =>
                updateField(
                  "rehireRecommendation",
                  event.target.value as ReferenceResponseFormData["rehireRecommendation"],
                )
              }
              placeholder="Select an option"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              error={errors.rehireRecommendation}
            />
          </div>

          <FormTextarea
            id="written-comments"
            label="Comments"
            value={form.writtenComments}
            onChange={(event) => updateField("writtenComments", event.target.value)}
            placeholder="Share your professional assessment of this candidate..."
            rows={6}
            error={errors.writtenComments}
          />
        </>
      )}

      <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <input
          type="checkbox"
          checked={form.attestationConfirmed}
          onChange={(event) =>
            updateField("attestationConfirmed", event.target.checked)
          }
          className="mt-1 h-4 w-4 rounded text-blue-600"
        />
        <span className="text-sm text-gray-700">
          I confirm that the information provided in this reference is accurate
          to the best of my knowledge.
          {errors.attestationConfirmed ? (
            <span className="mt-1 block text-red-600">
              {errors.attestationConfirmed}
            </span>
          ) : null}
        </span>
      </label>

      {error ? <FormError message={error} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Signed in email must match <strong>{invitation.refereeEmail}</strong>.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Reference"}
        </button>
      </div>
    </form>
  );
}
