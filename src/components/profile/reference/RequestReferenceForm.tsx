"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

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
import { useInvalidateCandidateReferences } from "@/lib/query/use-reference-queries";
import {
  showReferenceRequestErrorToast,
  showReferenceRequestSentToast,
} from "@/lib/references/reference-toast";

type EmploymentHistoryOption = {
  id: string;
  label: string;
};

type RequestReferenceFormProps = {
  onCancel?: () => void;
  onSubmitted?: (data: RequestReferenceFormData) => void;
  showActions?: boolean;
  employmentHistoryOptions?: EmploymentHistoryOption[];
};

export function RequestReferenceForm({
  onCancel,
  onSubmitted,
  showActions = true,
  employmentHistoryOptions = [],
}: RequestReferenceFormProps) {
  const [form, setForm] = useState(createEmptyReferenceRequest);
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof ReferenceFieldErrors>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const invalidateReferences = useInvalidateCandidateReferences();

  function updateField<K extends keyof RequestReferenceFormData>(
    field: K,
    value: RequestReferenceFormData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    clearField(field);
    setError("");
  }

  async function handleSubmit() {
    const fieldErrors = getReferenceFieldErrors(form);

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setError("");

    try {
      const response = await fetch("/api/candidate/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        fieldErrors?: ReferenceFieldErrors;
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
      invalidateReferences();
      onSubmitted?.(form);
      setForm(createEmptyReferenceRequest());
    } catch {
      const message = "Unable to send reference request. Please try again.";
      setError(message);
      showReferenceRequestErrorToast(message);
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
      className="space-y-4"
    >
      <ReferenceRequestFormFields
        form={form}
        errors={errors}
        employmentHistoryOptions={employmentHistoryOptions}
        onFieldChange={updateField}
      />

      {error ? <FormError message={error} /> : null}

      {showActions ? (
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            <Mail className="h-4 w-4" />
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
