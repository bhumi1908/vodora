"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import {
  createEmptyReferenceRequest,
  REFERENCE_RELATIONSHIP_OPTIONS,
  type RequestReferenceFormData,
} from "@/components/profile/reference/types";

type RequestReferenceFormProps = {
  onCancel?: () => void;
  onSubmitted?: (data: RequestReferenceFormData) => void;
  showActions?: boolean;
};

function validateReferenceRequest(
  data: RequestReferenceFormData,
): string | null {
  if (!data.name.trim()) {
    return "Name is required.";
  }

  if (!data.title.trim()) {
    return "Title is required.";
  }

  if (!data.company.trim()) {
    return "Company is required.";
  }

  if (!data.email.trim()) {
    return "Email is required.";
  }

  if (!/\S+@\S+\.\S+/.test(data.email.trim())) {
    return "Enter a valid email address.";
  }

  if (!data.phone.trim()) {
    return "Phone is required.";
  }

  if (!data.relationship) {
    return "Relationship is required.";
  }

  return null;
}

export function RequestReferenceForm({
  onCancel,
  onSubmitted,
  showActions = true,
}: RequestReferenceFormProps) {
  const [form, setForm] = useState(createEmptyReferenceRequest);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RequestReferenceFormData>(
    field: K,
    value: RequestReferenceFormData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit() {
    const validationError = validateReferenceRequest(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Frontend-only for now — API integration will be added later.
    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsSubmitting(false);
    onSubmitted?.(form);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="space-y-4"
    >
      <AuthFormGrid>
        <FormField
          id="reference-name"
          label="Name"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="John Doe"
        />
        <FormField
          id="reference-title"
          label="Title"
          required
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Engineering Manager"
        />
      </AuthFormGrid>

      <FormField
        id="reference-company"
        label="Company"
        required
        value={form.company}
        onChange={(event) => updateField("company", event.target.value)}
        placeholder="Company Name"
      />

      <AuthFormGrid>
        <FormField
          id="reference-email"
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="john@example.com"
        />
        <FormField
          id="reference-phone"
          label="Phone"
          type="tel"
          required
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </AuthFormGrid>

      <FormSelect
        id="reference-relationship"
        label="Relationship"
        required
        value={form.relationship}
        onChange={(event) =>
          updateField(
            "relationship",
            event.target.value as RequestReferenceFormData["relationship"],
          )
        }
        placeholder="Select relationship"
        options={[...REFERENCE_RELATIONSHIP_OPTIONS]}
      />

      <FormTextarea
        id="reference-message"
        label="Message (Optional)"
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="Add a personal message to include in the reference request email..."
        rows={4}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <input
          type="checkbox"
          checked={form.allowProfileCreation}
          onChange={(event) =>
            updateField("allowProfileCreation", event.target.checked)
          }
          className="mt-0.5 h-4 w-4 shrink-0 rounded text-blue-600"
        />
        <span className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">
            Allow Vodora to create a profile for this reference
          </span>
          <span className="mt-1 block text-gray-600">
            We will invite them to join Vodora and create a professional
            profile. They can decline at any time.
          </span>
        </span>
      </label>

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
