"use client";

import { CheckCircle, FileText, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AuthFormGrid, FormError, FormField } from "@/components/auth/shared/FormFields";
import { ReferenceRequestFormFields } from "@/components/profile/reference/ReferenceRequestFormFields";
import {
  createEmptyReferenceRequest,
  type RequestReferenceFormData,
} from "@/components/profile/reference/types";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { useSessionFormDraft } from "@/hooks/useSessionFormDraft";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  buildSessionFormDraftKey,
  isRecordEqualToEmpty,
} from "@/lib/form/session-form-draft";
import {
  getRecruiterReferenceCollectionCandidateFieldErrors,
  getReferenceFieldErrors,
  type RecruiterReferenceCollectionCandidateFieldErrors,
  type ReferenceFieldErrors,
} from "@/lib/profile/reference-validation";
import {
  showReferenceRequestErrorToast,
  showReferenceRequestSentToast,
} from "@/lib/references/reference-toast";
import { useInvalidateCandidateReferences } from "@/lib/query/use-reference-queries";

type CollectReferenceTabProps = {
  recruiterUserId: string;
  recruiterName: string;
  companyName: string | null;
};

type CollectReferenceDraft = {
  candidateForm: CandidateFormData;
  referenceForm: RequestReferenceFormData;
};

type CandidateFormData = {
  name: string;
  title: string;
  company: string;
  email: string;
};

type SentState = {
  candidateName: string;
  refereeName: string;
};

const emptyCandidateForm = (): CandidateFormData => ({
  name: "",
  title: "",
  company: "",
  email: "",
});

function isCollectReferenceDraftEmpty(draft: CollectReferenceDraft): boolean {
  return (
    isRecordEqualToEmpty(draft.candidateForm, emptyCandidateForm()) &&
    isRecordEqualToEmpty(draft.referenceForm, createEmptyReferenceRequest())
  );
}

export function CollectReferenceTab({
  recruiterUserId,
  recruiterName: _recruiterName,
  companyName: _companyName,
}: CollectReferenceTabProps) {
  const [candidateForm, setCandidateForm] = useState<CandidateFormData>(
    emptyCandidateForm,
  );
  const [form, setForm] = useState(createEmptyReferenceRequest);
  const [sent, setSent] = useState<SentState | null>(null);
  const draftData = useMemo<CollectReferenceDraft>(
    () => ({ candidateForm, referenceForm: form }),
    [candidateForm, form],
  );
  const { restoreDraft, clearDraft, markHydrated } = useSessionFormDraft({
    storageKey: buildSessionFormDraftKey(
      "recruiter-collect-reference",
      recruiterUserId,
    ),
    data: draftData,
    enabled: sent === null,
    isEmpty: isCollectReferenceDraftEmpty,
  });
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof ReferenceFieldErrors>();
  const {
    errors: candidateErrors,
    setErrors: setCandidateErrors,
    clearField: clearCandidateField,
  } = useFieldErrors<keyof RecruiterReferenceCollectionCandidateFieldErrors>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const invalidateReferences = useInvalidateCandidateReferences();

  useEffect(() => {
    const draft = restoreDraft();

    if (draft) {
      setCandidateForm(draft.candidateForm);
      setForm(draft.referenceForm);
    }

    markHydrated();
  }, [markHydrated, recruiterUserId, restoreDraft]);

  function updateCandidateField<K extends keyof CandidateFormData>(
    field: K,
    value: CandidateFormData[K],
  ) {
    setCandidateForm((current) => ({ ...current, [field]: value }));
    clearCandidateField(field);
    setError("");
  }

  function updateField<K extends keyof RequestReferenceFormData>(
    field: K,
    value: RequestReferenceFormData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    clearField(field);
    setError("");
  }

  async function handleSubmit() {
    const candidateFieldErrors =
      getRecruiterReferenceCollectionCandidateFieldErrors(candidateForm);
    const fieldErrors = getReferenceFieldErrors(form);

    if (hasFieldErrors(candidateFieldErrors)) {
      setCandidateErrors(candidateFieldErrors);
    }

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
    }

    if (
      hasFieldErrors(candidateFieldErrors) ||
      hasFieldErrors(fieldErrors)
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setCandidateErrors({});
    setError("");

    try {
      const response = await fetch("/api/recruiter/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: candidateForm,
          ...form,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        fieldErrors?: ReferenceFieldErrors;
        candidateFieldErrors?: RecruiterReferenceCollectionCandidateFieldErrors;
        candidateName?: string;
      };

      if (!response.ok || !result.success) {
        if (result.candidateFieldErrors) {
          setCandidateErrors(result.candidateFieldErrors);
        }

        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }

        const message =
          result.error ?? "Unable to send reference request.";
        setError(message);
        showReferenceRequestErrorToast(message);
        return;
      }

      showReferenceRequestSentToast(form.name);
      invalidateReferences();
      clearDraft();
      setSent({
        candidateName: result.candidateName ?? candidateForm.name.trim(),
        refereeName: form.name,
      });
      setCandidateForm(emptyCandidateForm());
      setForm(createEmptyReferenceRequest());
    } catch {
      const message = "Unable to send reference request. Please try again.";
      setError(message);
      showReferenceRequestErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    clearDraft();
    setSent(null);
    setCandidateForm(emptyCandidateForm());
    setForm(createEmptyReferenceRequest());
    setErrors({});
    setCandidateErrors({});
    setError("");
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold text-gray-900">
          Reference Request Sent
        </h3>
        <p className="mb-8 leading-relaxed text-gray-500">
          Your reference request has been saved. We&apos;re sending emails to{" "}
          <strong>{sent.refereeName}</strong> and{" "}
          <strong>{sent.candidateName}</strong> now. If delivery fails, you can
          resend the referee invitation from Reference History.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Collect Another Reference
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          Collect a Reference
        </h2>
        <p className="text-sm text-gray-500">
          Enter candidate and referee details. Vodora will email the referee a
          secure link to complete a verified reference, and notify the candidate
          to access or claim their Reference Passport.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        noValidate
        className="space-y-8"
      >
        <section>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Candidate Details</h3>
          </div>

          <div className="space-y-4">
            <FormField
              id="collect-reference-candidate-name"
              label="Full Name"
              required
              value={candidateForm.name}
              onChange={(event) =>
                updateCandidateField("name", event.target.value)
              }
              placeholder="Jane Doe"
              error={candidateErrors.name}
            />

            <AuthFormGrid>
              <FormField
                id="collect-reference-candidate-title"
                label="Job Title"
                required
                value={candidateForm.title}
                onChange={(event) =>
                  updateCandidateField("title", event.target.value)
                }
                placeholder="Software Engineer"
                error={candidateErrors.title}
              />
              <FormField
                id="collect-reference-candidate-company"
                label="Company"
                required
                value={candidateForm.company}
                onChange={(event) =>
                  updateCandidateField("company", event.target.value)
                }
                placeholder="Company Name"
                error={candidateErrors.company}
              />
            </AuthFormGrid>

            <FormField
              id="collect-reference-candidate-email"
              label="Candidate Email"
              type="email"
              required
              value={candidateForm.email}
              onChange={(event) =>
                updateCandidateField("email", event.target.value)
              }
              placeholder="candidate@email.com"
              error={candidateErrors.email}
            />
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              If the candidate is not on Vodora yet, we will create a profile for
              them and email a password setup link. If they already have an
              account, they will receive a notification instead.
            </p>
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section>
          <ReferenceRequestFormFields
            form={form}
            errors={errors}
            onFieldChange={updateField}
          />
        </section>

        {error ? <FormError message={error} /> : null}

        <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            <span className="text-red-400">*</span> Required fields
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Sending…" : "Send Reference Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
