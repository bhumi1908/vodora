"use client";

import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Lock,
  Shield,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ReferenceQuestionnaireFields } from "@/components/profile/reference/ReferenceQuestionnaireFields";
import {
  createEmptyReferenceResponse,
  normalizeReferenceType,
  type ReferenceResponseFormData,
} from "@/components/profile/reference/types";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { useSessionFormDraft } from "@/hooks/useSessionFormDraft";
import {
  buildSessionFormDraftKey,
} from "@/lib/form/session-form-draft";
import {
  getReferenceResponseFieldErrors,
  hasReferenceResponseFieldErrors,
  type ReferenceResponseFieldErrors,
} from "@/lib/profile/reference-validation";
import type { ReferenceInvitationDetails } from "@/lib/references/fetch-reference-invitation";
import {
  showReferenceSubmitErrorToast,
  showReferenceSubmitSuccessToast,
} from "@/lib/references/reference-toast";
import {
  WRITTEN_REFERENCE_ASSESSMENT,
  type WrittenAssessmentQuestionId,
} from "@/lib/references/written-reference-assessment";

type ReferenceRespondFormProps = {
  invitation: ReferenceInvitationDetails;
  token: string;
  onSubmitted: (result: {
    status: "verified" | "submitted" | "rejected";
    responseId: string;
    form: ReferenceResponseFormData;
    welcomeRedirectTo?: string;
    profileSetupRequested?: boolean;
  }) => void;
};

function Select({
  label,
  options,
  value,
  onChange,
  required,
  error,
  number,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  number?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {number ? `${number}. ` : ""}
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${readOnly ? "bg-gray-50 text-gray-600" : ""} ${
          readOnly && type === "date"
            ? "[&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
            : ""
        }`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
        <span className="text-sm font-bold text-white">{number}</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

const PROFESSIONAL_ASSESSMENT_QUESTIONS = WRITTEN_REFERENCE_ASSESSMENT.filter(
  (question) => question.section === "professional_assessment",
);

const WRITTEN_FEEDBACK_QUESTIONS = WRITTEN_REFERENCE_ASSESSMENT.filter(
  (question) => question.section === "written_feedback",
);

const REHIRE_QUESTIONS = WRITTEN_REFERENCE_ASSESSMENT.filter(
  (question) => question.section === "rehire",
);

type ReferenceRespondDraft = {
  form: ReferenceResponseFormData;
  workedTogether: "yes" | "no" | "";
};

function createInitialReferenceResponse(
  invitation: ReferenceInvitationDetails,
): ReferenceResponseFormData {
  return createEmptyReferenceResponse({
    positionHeld: invitation.candidateTitle?.trim() || "Not specified",
    refereePhone: invitation.refereePhone ?? "",
  });
}

function isReferenceRespondDraftEmpty(draft: ReferenceRespondDraft): boolean {
  if (draft.workedTogether !== "") {
    return false;
  }

  if (draft.form.attestationConfirmed || draft.form.allowProfileCreation) {
    return false;
  }

  if (
    draft.form.refereePhone.trim() ||
    draft.form.refereeLinkedIn.trim() ||
    draft.form.signatureName.trim()
  ) {
    return false;
  }

  const hasWrittenAnswers = Object.values(
    draft.form.writtenAssessmentAnswers,
  ).some((value) => value.trim() !== "");

  if (hasWrittenAnswers) {
    return false;
  }

  return !Object.values(draft.form.questionnaireAnswers).some(
    (value) => value.trim() !== "",
  );
}

export function ReferenceRespondForm({
  invitation,
  token,
  onSubmitted,
}: ReferenceRespondFormProps) {
  const [form, setForm] = useState(() => createInitialReferenceResponse(invitation));
  const [workedTogether, setWorkedTogether] = useState<"yes" | "no" | "">("");
  const draftData = useMemo<ReferenceRespondDraft>(
    () => ({ form, workedTogether }),
    [form, workedTogether],
  );
  const { restoreDraft, clearDraft, markHydrated } = useSessionFormDraft({
    storageKey: buildSessionFormDraftKey("reference-respond", token),
    data: draftData,
    isEmpty: isReferenceRespondDraftEmpty,
  });
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof ReferenceResponseFieldErrors>();
  const [questionnaireErrors, setQuestionnaireErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [writtenAssessmentErrors, setWrittenAssessmentErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const draft = restoreDraft();

    if (draft) {
      const restoredWorkedTogether =
        draft.workedTogether || draft.form.workedTogether || "";
      setForm({
        ...draft.form,
        workedTogether: restoredWorkedTogether,
      });
      setWorkedTogether(restoredWorkedTogether);
    }

    markHydrated();
  }, [markHydrated, restoreDraft, token]);

  const referenceType = normalizeReferenceType(invitation.referenceType);
  const isQuestionnaire = referenceType === "questionnaire";

  function updateField<K extends keyof ReferenceResponseFormData>(
    field: K,
    value: ReferenceResponseFormData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    clearField(field);
    setError("");
  }

  function updateWorkedTogether(value: "yes" | "no") {
    setWorkedTogether(value);
    setForm((current) => ({
      ...current,
      workedTogether: value,
      employmentConfirmed: value === "yes",
      ...(value === "yes"
        ? {
            employmentDatesConfirmed: true,
            positionHeld:
              current.positionHeld.trim() ||
              invitation.candidateTitle?.trim() ||
              current.positionHeld,
          }
        : {}),
    }));
    clearField("employmentConfirmed");
    setQuestionnaireErrors({});
    setWrittenAssessmentErrors({});
    setError("");
  }

  function updateWrittenAssessmentAnswer(
    questionId: WrittenAssessmentQuestionId,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      writtenAssessmentAnswers: {
        ...current.writtenAssessmentAnswers,
        [questionId]: value,
      },
    }));
    setWrittenAssessmentErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
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

  const isRejection = workedTogether === "no";
  const isAcceptance = workedTogether === "yes";

  const isValid = isRejection
    ? Boolean(form.signatureName.trim()) &&
      !hasReferenceResponseFieldErrors(
        getReferenceResponseFieldErrors(
          { ...form, workedTogether: "no", employmentConfirmed: false },
          referenceType,
        ),
      )
    : isAcceptance &&
      form.attestationConfirmed &&
      Boolean(form.signatureName.trim()) &&
      !hasReferenceResponseFieldErrors(
        getReferenceResponseFieldErrors(
          {
            ...form,
            workedTogether: "yes",
            employmentConfirmed: true,
            employmentDatesConfirmed: true,
            positionHeld:
              form.positionHeld.trim() ||
              invitation.candidateTitle?.trim() ||
              "Not specified",
          },
          referenceType,
        ),
      );

  async function handleSubmit() {
    const submissionForm: ReferenceResponseFormData = {
      ...form,
      workedTogether,
      employmentConfirmed: workedTogether === "yes",
      employmentDatesConfirmed:
        workedTogether === "yes" ? true : form.employmentDatesConfirmed,
      positionHeld:
        workedTogether === "yes"
          ? form.positionHeld.trim() ||
            invitation.candidateTitle?.trim() ||
            "Not specified"
          : form.positionHeld,
    };

    const fieldErrors = getReferenceResponseFieldErrors(
      submissionForm,
      referenceType,
    );

    if (hasReferenceResponseFieldErrors(fieldErrors)) {
      const { questionnaire, writtenAssessment, ...rest } = fieldErrors;
      setErrors(rest);
      setQuestionnaireErrors(questionnaire ?? {});
      setWrittenAssessmentErrors(writtenAssessment ?? {});
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reference/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, response: submissionForm }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        fieldErrors?: ReferenceResponseFieldErrors;
        status?: "verified" | "submitted" | "rejected";
        responseId?: string;
        welcomeRedirectTo?: string;
        profileSetupRequested?: boolean;
      };

      if (!response.ok || !result.success || !result.responseId) {
        if (result.fieldErrors) {
          const { questionnaire, writtenAssessment, ...rest } = result.fieldErrors;
          setErrors(rest);
          setQuestionnaireErrors(questionnaire ?? {});
          setWrittenAssessmentErrors(writtenAssessment ?? {});
        }

        const message = result.error ?? "Unable to submit reference.";
        setError(message);
        showReferenceSubmitErrorToast(message);
        return;
      }

      showReferenceSubmitSuccessToast(
        result.status === "verified",
        result.status === "rejected",
      );
      clearDraft();
      onSubmitted({
        status: result.status ?? "submitted",
        responseId: result.responseId,
        form: submissionForm,
        welcomeRedirectTo: result.welcomeRedirectTo,
        profileSetupRequested: result.profileSetupRequested,
      });
    } catch {
      const message = "Unable to submit reference. Please try again.";
      setError(message);
      showReferenceSubmitErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const candidateMessage =
    invitation.candidateMessage ??
    "Thank you for taking the time to provide a professional reference. Your feedback helps verify my professional history and experience. Responses are securely stored and timestamped within Vodora.";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
      className="space-y-6"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <p className="mb-4 text-sm text-gray-500">
          You have been nominated as a referee by:
        </p>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
            <span className="text-xl font-bold text-blue-700">
              {invitation.candidateInitials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {invitation.candidateName}
            </h2>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
              {invitation.candidateTitle ? (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  {invitation.candidateTitle}
                </span>
              ) : null}
              {invitation.candidateCompany ? (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {invitation.candidateCompany}
                </span>
              ) : null}
              {invitation.employmentPeriod ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {invitation.employmentPeriod}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm italic leading-relaxed text-blue-800">
            &ldquo;{candidateMessage}&rdquo;
          </p>
        </div>
        <div className="mt-3 flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-xs text-gray-500">
            This reference is stored once and can help the candidate throughout
            their career, reducing repeated requests to managers and referees.
            Responses are securely stored and timestamped within Vodora.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <SectionHeading number="1" title="Referee Verification — Your Details" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Full Name"
            value={invitation.refereeName}
            onChange={() => undefined}
            readOnly
            required
          />
          <TextInput
            label="Position / Job Title"
            value={invitation.refereeTitle}
            onChange={() => undefined}
            readOnly
            required
          />
          <TextInput
            label="Company"
            value={invitation.refereeCompany}
            onChange={() => undefined}
            readOnly
            required
          />
          <TextInput
            label="Corporate Email"
            type="email"
            value={invitation.refereeEmail}
            onChange={() => undefined}
            readOnly
            required
          />
          <TextInput
            label="Phone Number"
            type="tel"
            value={form.refereePhone}
            onChange={(value) => updateField("refereePhone", value)}
            placeholder="+61 4XX XXX XXX"
          />
          <TextInput
            label="LinkedIn Profile URL"
            value={form.refereeLinkedIn}
            onChange={(value) => updateField("refereeLinkedIn", value)}
            placeholder="linkedin.com/in/johnsmith"
          />
        </div>
        <div className="mt-4">
          <TextInput
            label="Relationship to Candidate"
            value={invitation.relationshipLabel}
            onChange={() => undefined}
            readOnly
            required
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <SectionHeading number="2" title="Employment Verification" />
        <p className="mb-4 text-sm text-gray-600">Did this person work with you?</p>
        <div className="flex gap-6">
          {(["yes", "no"] as const).map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="workedTogether"
                value={option}
                checked={workedTogether === option}
                onChange={() => updateWorkedTogether(option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium capitalize text-gray-700">
                {option}
              </span>
            </label>
          ))}
        </div>
        {errors.employmentConfirmed ? (
          <p className="mt-2 text-sm text-red-600">{errors.employmentConfirmed}</p>
        ) : null}
        {workedTogether === "no" ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              You&apos;ve indicated this person did not work with you. Please ensure
              you are the correct referee before proceeding.
            </p>
          </div>
        ) : null}
      </div>

      {isQuestionnaire ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <SectionHeading number="3" title="Structured Questionnaire" />
          <ReferenceQuestionnaireFields
            answers={form.questionnaireAnswers}
            errors={questionnaireErrors}
            onAnswerChange={updateQuestionnaireAnswer}
          />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <SectionHeading number="3" title="Professional Assessment" />
            <div className="space-y-5">
              {PROFESSIONAL_ASSESSMENT_QUESTIONS.map((question, index) => {
                const label =
                  question.type === "select" && question.description
                    ? `${question.label} — ${question.description}`
                    : question.label;

                return (
                <Select
                  key={question.id}
                  number={index + 1}
                  label={label}
                  required={question.required}
                  value={form.writtenAssessmentAnswers[question.id]}
                  onChange={(value) =>
                    updateWrittenAssessmentAnswer(question.id, value)
                  }
                  options={[
                    ...(question.type === "select" ? question.options : []),
                  ]}
                  error={writtenAssessmentErrors[question.id]}
                />
              );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <SectionHeading number="4" title="Written Feedback" />
            <div className="space-y-5">
              {WRITTEN_FEEDBACK_QUESTIONS.map((question) => {
                if (question.type !== "select") {
                  return (
                    <div key={question.id}>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {question.label}
                      </label>
                      <textarea
                        rows={4}
                        value={form.writtenAssessmentAnswers[question.id]}
                        onChange={(event) =>
                          updateWrittenAssessmentAnswer(
                            question.id,
                            event.target.value,
                          )
                        }
                        placeholder={question.placeholder}
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {writtenAssessmentErrors[question.id] ? (
                        <p className="mt-1 text-sm text-red-600">
                          {writtenAssessmentErrors[question.id]}
                        </p>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Select
                    key={question.id}
                    label={question.label}
                    value={form.writtenAssessmentAnswers[question.id]}
                    onChange={(value) =>
                      updateWrittenAssessmentAnswer(question.id, value)
                    }
                    options={[...question.options]}
                    error={writtenAssessmentErrors[question.id]}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <SectionHeading number="5" title="Rehire Recommendation" />
            {REHIRE_QUESTIONS.map((question) => (
              <Select
                key={question.id}
                label={question.label}
                required={question.required}
                value={form.writtenAssessmentAnswers[question.id]}
                onChange={(value) =>
                  updateWrittenAssessmentAnswer(question.id, value)
                }
                options={[...(question.type === "select" ? question.options : [])]}
                error={writtenAssessmentErrors[question.id]}
              />
            ))}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <SectionHeading number="6" title="Digital Declaration" />
        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">I confirm that:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "I know the candidate professionally.",
              "The information provided is true and accurate to the best of my knowledge.",
              "I understand this reference will be stored within the candidate's Vodora Trust Profile.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.attestationConfirmed}
              onChange={(event) =>
                updateField("attestationConfirmed", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I agree to the above declaration and confirm this reference is genuine
            </span>
          </label>
          {errors.attestationConfirmed ? (
            <p className="text-sm text-red-600">{errors.attestationConfirmed}</p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Full Name"
              value={form.signatureName}
              onChange={(value) => updateField("signatureName", value)}
              placeholder="Your full name"
              required
              error={errors.signatureName}
            />
            <TextInput
              label="Date"
              type="date"
              value={form.signatureDate}
              onChange={() => undefined}
              readOnly
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Digital Signature
            </label>
            <div className="flex h-16 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-sm italic text-gray-400">
                {form.signatureName
                  ? `— ${form.signatureName}`
                  : "Your name above serves as your digital signature"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.allowProfileCreation}
            onChange={(event) =>
              updateField("allowProfileCreation", event.target.checked)
            }
            className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Would you like Vodora to create a profile for you?
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              As a verified referee your profile will be pre-populated with your
              name, title, and company. You&apos;ll receive an email to complete your
              setup. Completely optional.
            </p>
          </div>
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FileText className="h-5 w-5" />
        {isSubmitting
          ? "Submitting..."
          : isRejection
            ? "Submit Decline"
            : "Submit Reference"}
      </button>

      {!isValid ? (
        <p className="text-center text-xs text-gray-400">
          {isRejection
            ? "Sign below to confirm you did not work with this candidate."
            : "Complete all required fields (*) and the declaration to submit."}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2 pb-2 text-xs text-gray-400 sm:gap-4">
        <span className="flex items-center gap-1">
          <Lock className="h-3.5 w-3.5" />
          End-to-end encrypted
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" />
          GDPR compliant
        </span>
        <span className="hidden sm:inline">·</span>
        <span>Powered by Vodora</span>
      </div>
    </form>
  );
}
