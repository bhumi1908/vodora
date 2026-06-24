"use client";

import { CheckCircle, FileText, Send, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { FormError } from "@/components/auth/shared/FormFields";
import { ReferenceRequestFormFields } from "@/components/profile/reference/ReferenceRequestFormFields";
import {
  createEmptyReferenceRequest,
  type RequestReferenceFormData,
} from "@/components/profile/reference/types";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  getReferenceFieldErrors,
  type ReferenceFieldErrors,
} from "@/lib/profile/reference-validation";
import type {
  ReferenceCollectionCandidateDetails,
  ReferenceCollectionCandidateOption,
} from "@/lib/recruiter/fetch-reference-collection-candidates";
import {
  showReferenceRequestErrorToast,
  showReferenceRequestSentToast,
} from "@/lib/references/reference-toast";

type CollectReferenceTabProps = {
  recruiterName: string;
  companyName: string | null;
};

type SentState = {
  candidateName: string;
  refereeName: string;
};

export function CollectReferenceTab({
  recruiterName: _recruiterName,
  companyName: _companyName,
}: CollectReferenceTabProps) {
  const [candidateOptions, setCandidateOptions] = useState<
    ReferenceCollectionCandidateOption[]
  >([]);
  const [candidatesError, setCandidatesError] = useState("");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [candidateDetails, setCandidateDetails] =
    useState<ReferenceCollectionCandidateDetails | null>(null);
  const [isLoadingCandidateDetails, setIsLoadingCandidateDetails] =
    useState(false);
  const [candidateDetailsError, setCandidateDetailsError] = useState("");
  const [form, setForm] = useState(createEmptyReferenceRequest);
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof ReferenceFieldErrors>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState<SentState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCandidates() {
      setIsLoadingCandidates(true);
      setCandidatesError("");

      try {
        const response = await fetch("/api/recruiter/references");
        const result = (await response.json()) as {
          success: boolean;
          candidates?: ReferenceCollectionCandidateOption[];
          error?: string;
        };

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Could not load candidates.");
        }

        if (!cancelled) {
          setCandidateOptions(result.candidates ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCandidatesError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load candidates.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCandidates(false);
        }
      }
    }

    void loadCandidates();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadCandidateDetails = useCallback(
    async (candidateId: string, vodoraId?: string) => {
      if (!candidateId) {
        setCandidateDetails(null);
        setCandidateDetailsError("");
        return;
      }

      setIsLoadingCandidateDetails(true);
      setCandidateDetailsError("");

      try {
        const query = vodoraId
          ? `?vodoraId=${encodeURIComponent(vodoraId)}`
          : "";
        const response = await fetch(
          `/api/recruiter/references/candidates/${encodeURIComponent(candidateId)}${query}`,
        );
        const result = (await response.json()) as {
          success: boolean;
          candidate?: ReferenceCollectionCandidateDetails;
          error?: string;
        };

        if (!response.ok || !result.success || !result.candidate) {
          throw new Error(result.error ?? "Could not load candidate details.");
        }

        setCandidateDetails(result.candidate);
      } catch (loadError) {
      setCandidateDetails(null);
      setCandidateDetailsError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load candidate details.",
      );
    } finally {
      setIsLoadingCandidateDetails(false);
    }
  },
    [],
  );

  function handleCandidateChange(candidateId: string) {
    const option = candidateOptions.find(
      (candidate) => candidate.candidateId === candidateId,
    );
    setSelectedCandidateId(candidateId);
    void loadCandidateDetails(candidateId, option?.vodoraId);
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
    if (!selectedCandidateId) {
      setError("Select a candidate before sending the reference request.");
      return;
    }

    if (!candidateDetails) {
      setError("Candidate details could not be loaded. Please try again.");
      return;
    }

    const fieldErrors = getReferenceFieldErrors(form);

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setError("");

    try {
      const response = await fetch("/api/recruiter/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidateId,
          ...form,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        fieldErrors?: ReferenceFieldErrors;
        candidateName?: string;
      };

      if (!response.ok || !result.success) {
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
      setSent({
        candidateName: result.candidateName ?? candidateDetails.name,
        refereeName: form.name,
      });
      setSelectedCandidateId("");
      setCandidateDetails(null);
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
    setSent(null);
    setSelectedCandidateId("");
    setCandidateDetails(null);
    setForm(createEmptyReferenceRequest());
    setErrors({});
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
          An email has been sent to{" "}
          <strong>{sent.refereeName}</strong> with a secure link to complete a
          reference for <strong>{sent.candidateName}</strong>.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Collect Another Reference
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          Collect a Reference
        </h2>
        <p className="text-sm text-gray-500">
          Select a verified candidate and enter referee details. Vodora will email
          the referee a secure link to complete a verified reference on the
          candidate&apos;s behalf.
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="collect-reference-candidate"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <select
                id="collect-reference-candidate"
                value={selectedCandidateId}
                onChange={(event) => handleCandidateChange(event.target.value)}
                disabled={isLoadingCandidates}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">
                  {isLoadingCandidates
                    ? "Loading verified candidates…"
                    : "Select a verified candidate…"}
                </option>
                {candidateOptions.map((candidate) => (
                  <option key={candidate.candidateId} value={candidate.candidateId}>
                    {candidate.name}
                    {candidate.title ? ` — ${candidate.title}` : ""}
                  </option>
                ))}
              </select>
              {candidatesError ? (
                <p className="mt-1.5 text-xs text-red-600">{candidatesError}</p>
              ) : null}
            </div>

            <CollectReferenceReadOnlyField
              label="Job Title"
              value={
                isLoadingCandidateDetails
                  ? "Loading…"
                  : (candidateDetails?.title ?? "")
              }
              placeholder="Select a candidate"
            />
            <CollectReferenceReadOnlyField
              label="Company"
              value={
                isLoadingCandidateDetails
                  ? "Loading…"
                  : (candidateDetails?.company ?? "")
              }
              placeholder="Select a candidate"
            />
            <CollectReferenceReadOnlyField
              label="Candidate Email"
              required
              value={
                isLoadingCandidateDetails
                  ? "Loading…"
                  : (candidateDetails?.email ?? "")
              }
              placeholder="Select a candidate"
            />
          </div>

          {candidateDetailsError ? (
            <p className="mt-3 text-xs text-red-600">{candidateDetailsError}</p>
          ) : null}

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              The candidate will receive an email notifying them that a reference
              is being collected on their behalf, and an invitation to create a
              free Vodora profile to permanently own and reuse this reference.
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
            disabled={
              isSubmitting ||
              isLoadingCandidates ||
              isLoadingCandidateDetails ||
              !selectedCandidateId ||
              !candidateDetails
            }
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

type CollectReferenceReadOnlyFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
};

function CollectReferenceReadOnlyField({
  label,
  value,
  placeholder,
  required = false,
}: CollectReferenceReadOnlyFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="text"
        readOnly
        value={value}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
      />
    </div>
  );
}
