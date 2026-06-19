"use client";

import { useMemo, useState } from "react";

import {
  FormCheckboxGrid,
  FormError,
  FormSelect,
  FormSuccess,
} from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import { WORK_TYPE_OPTIONS } from "@/lib/auth/constants";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  HIRING_EXPERIENCE_LEVEL_OPTIONS,
  REMOTE_PREFERENCE_OPTIONS,
} from "@/lib/recruiter/hiring-preferences";
import {
  getRecruiterHiringPreferencesFieldErrors,
  type RecruiterHiringPreferencesFieldErrors,
} from "@/lib/recruiter/profile-validation";
import type { RecruiterHiringPreferencesFields } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { isRecruiterHiringPreferencesDirty } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { useSaveRecruiterHiringPreferencesMutation } from "@/lib/query/use-recruiter-profile-mutations";

const workTypeOptions = WORK_TYPE_OPTIONS.map((option) => ({
  value: option.code,
  label: option.label,
}));

type RecruiterHiringPreferencesEditSectionProps = {
  value: RecruiterHiringPreferencesFields;
  savedValue: RecruiterHiringPreferencesFields;
  onChange: (value: RecruiterHiringPreferencesFields) => void;
  onSaved?: () => void;
  embedded?: boolean;
};

export function RecruiterHiringPreferencesEditSection({
  value,
  savedValue,
  onChange,
  onSaved,
  embedded = false,
}: RecruiterHiringPreferencesEditSectionProps) {
  const saveMutation = useSaveRecruiterHiringPreferencesMutation();
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof RecruiterHiringPreferencesFieldErrors>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isRecruiterHiringPreferencesDirty(savedValue, value),
    [savedValue, value],
  );

  function updateField<K extends keyof RecruiterHiringPreferencesFields>(
    field: K,
    fieldValue: RecruiterHiringPreferencesFields[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
    clearField(field);
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    const fieldErrors = getRecruiterHiringPreferencesFieldErrors(value);

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
        setError(result.error ?? "Failed to save hiring preferences.");
        return;
      }

      setSuccess("Hiring preferences saved.");
      onSaved?.();
    } catch {
      setError("Failed to save hiring preferences.");
    }
  }

  const content = (
    <>
      <FormSelect
        id="recruiter-edit-remote-preference"
        label="Remote Preference"
        value={value.remotePreference}
        onChange={(event) =>
          updateField("remotePreference", event.target.value)
        }
        options={[...REMOTE_PREFERENCE_OPTIONS]}
        error={errors.remotePreference}
      />

      <FormCheckboxGrid
        label="Preferred Work Types"
        options={workTypeOptions}
        value={value.preferredWorkTypeCodes}
        onChange={(preferredWorkTypeCodes) =>
          updateField("preferredWorkTypeCodes", preferredWorkTypeCodes)
        }
        error={errors.preferredWorkTypeCodes}
      />

      <FormCheckboxGrid
        label="Preferred Experience Levels"
        options={[...HIRING_EXPERIENCE_LEVEL_OPTIONS]}
        value={value.preferredExperienceLevels}
        onChange={(preferredExperienceLevels) =>
          updateField("preferredExperienceLevels", preferredExperienceLevels)
        }
        error={errors.preferredExperienceLevels}
      />

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        {content}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          <SectionSaveButton
            loading={saveMutation.isPending}
            disabled={!isDirty}
            onClick={() => void handleSave()}
          />
        </div>
      </div>
    );
  }

  return (
    <ProfileEditSection
      id="recruiter-hiring-preferences"
      title="Hiring Preferences"
      description="Tell us what kind of candidates you typically hire for."
      footer={
        <SectionSaveButton
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      {content}
    </ProfileEditSection>
  );
}
