"use client";

import { useMemo, useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSuccess,
} from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  getRecruiterDetailsFieldErrors,
  type RecruiterDetailsFieldErrors,
} from "@/lib/recruiter/profile-validation";
import { useSaveRecruiterDetailsMutation } from "@/lib/query/use-recruiter-profile-mutations";
import type { RecruiterDetailsFields } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { isRecruiterDetailsDirty } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";

type RecruiterDetailsEditSectionProps = {
  email: string;
  value: RecruiterDetailsFields;
  savedValue: RecruiterDetailsFields;
  onChange: (value: RecruiterDetailsFields) => void;
  onSaved?: () => void;
};

export function RecruiterDetailsEditSection({
  email,
  value,
  savedValue,
  onChange,
  onSaved,
}: RecruiterDetailsEditSectionProps) {
  const saveMutation = useSaveRecruiterDetailsMutation();
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof RecruiterDetailsFieldErrors>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isRecruiterDetailsDirty(savedValue, value),
    [savedValue, value],
  );

  function updateField<K extends keyof RecruiterDetailsFields>(
    field: K,
    fieldValue: RecruiterDetailsFields[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
    clearField(field);
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    const fieldErrors = getRecruiterDetailsFieldErrors(value);

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      setSuccess("");
      return;
    }

    setErrors({});
    setError("");
    setSuccess("");

    try {
      const result = await saveMutation.mutateAsync(value);

      if (!result.success) {
        setError(result.error ?? "Failed to save profile details.");
        return;
      }

      setSuccess("Profile details saved.");
      onSaved?.();
    } catch {
      setError("Failed to save profile details.");
    }
  }

  return (
    <ProfileEditSection
      id="recruiter-details"
      title="Profile Details"
      description="Your job title, contact information, and location shown on your profile."
      footer={
        <SectionSaveButton
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      <AuthFormGrid>
        <FormField
          id="recruiter-edit-title"
          label="Job Title"
          required
          value={value.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Talent Acquisition Manager"
          error={errors.title}
        />
        <div>
          <p className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </p>
          <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {email}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Contact support to change your login email.
          </p>
        </div>
      </AuthFormGrid>

      <FormField
        id="recruiter-edit-phone"
        label="Phone Number"
        type="tel"
        value={value.phone}
        onChange={(event) => updateField("phone", event.target.value)}
        placeholder="+61 400 000 000"
        error={errors.phone}
      />

      <AuthFormGrid>
        <FormField
          id="recruiter-edit-country"
          label="Country"
          required
          value={value.country}
          onChange={(event) => updateField("country", event.target.value)}
          placeholder="Australia"
          error={errors.country}
        />
        <FormField
          id="recruiter-edit-city"
          label="City"
          required
          value={value.city}
          onChange={(event) => updateField("city", event.target.value)}
          placeholder="Melbourne"
          error={errors.city}
        />
      </AuthFormGrid>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
