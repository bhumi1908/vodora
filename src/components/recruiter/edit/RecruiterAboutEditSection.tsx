"use client";

import { useMemo, useState } from "react";

import {
  FormError,
  FormSuccess,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import { TagPillSelector } from "@/components/recruiter/edit/TagPillSelector";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  RECRUITER_INDUSTRY_OPTIONS,
  RECRUITER_SPECIALISATION_OPTIONS,
} from "@/lib/recruiter/recruiter-profile-options";
import {
  getRecruiterAboutFieldErrors,
  type RecruiterAboutFieldErrors,
} from "@/lib/recruiter/profile-validation";
import { useSaveRecruiterAboutMutation } from "@/lib/query/use-recruiter-profile-mutations";
import type { RecruiterAboutFields } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { isRecruiterAboutDirty } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";

type RecruiterAboutEditSectionProps = {
  value: RecruiterAboutFields;
  savedValue: RecruiterAboutFields;
  onChange: (value: RecruiterAboutFields) => void;
  onSaved?: () => void;
};

export function RecruiterAboutEditSection({
  value,
  savedValue,
  onChange,
  onSaved,
}: RecruiterAboutEditSectionProps) {
  const saveMutation = useSaveRecruiterAboutMutation();
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof RecruiterAboutFieldErrors>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isRecruiterAboutDirty(savedValue, value),
    [savedValue, value],
  );

  function updateField<K extends keyof RecruiterAboutFields>(
    field: K,
    fieldValue: RecruiterAboutFields[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
    clearField(field);
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    const fieldErrors = getRecruiterAboutFieldErrors(value);

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
        setError(result.error ?? "Failed to save about section.");
        return;
      }

      setSuccess("About section saved.");
      onSaved?.();
    } catch {
      setError("Failed to save about section.");
    }
  }

  return (
    <ProfileEditSection
      id="recruiter-about"
      title="About & Expertise"
      description="Tell candidates about your experience and the areas you recruit in."
      footer={
        <SectionSaveButton
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      <FormTextarea
        id="recruiter-edit-bio"
        label="About"
        value={value.bio}
        onChange={(event) => updateField("bio", event.target.value)}
        placeholder="Share your recruiting background, focus areas, and what makes your approach unique."
        rows={6}
        error={errors.bio}
      />

      <TagPillSelector
        id="recruiter-edit-specialisations"
        label="Specialisations"
        options={RECRUITER_SPECIALISATION_OPTIONS}
        value={value.specialisations}
        onChange={(specialisations) => updateField("specialisations", specialisations)}
        error={errors.specialisations}
        variant="blue"
      />

      <TagPillSelector
        id="recruiter-edit-industries"
        label="Industries"
        options={RECRUITER_INDUSTRY_OPTIONS}
        value={value.industries}
        onChange={(industries) => updateField("industries", industries)}
        error={errors.industries}
        variant="gray"
      />

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
