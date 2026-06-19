"use client";

import { useMemo, useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSelect,
  FormSuccess,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { isOverviewDirty, type OverviewFields } from "@/components/profile/edit/profile-edit-dirty";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  getOverviewFieldErrors,
  PROFILE_FIELD_LIMITS,
  type OverviewFieldErrors,
} from "@/lib/profile/validation";
import { useSaveOverviewMutation } from "@/lib/query/use-profile-mutations";
import {
  AVAILABILITY_START_OPTIONS,
  AVAILABILITY_STATUS_OPTIONS,
} from "@/lib/profile/availability";
import { EXPERIENCE_LEVEL_OPTIONS } from "@/lib/profile/experience";

type OverviewEditSectionProps = {
  value: OverviewFields;
  savedValue: OverviewFields;
  onChange: (value: OverviewFields) => void;
  onSaved?: () => void;
};

export function OverviewEditSection({
  value,
  savedValue,
  onChange,
  onSaved,
}: OverviewEditSectionProps) {
  const saveMutation = useSaveOverviewMutation();
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof OverviewFieldErrors>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isOverviewDirty(savedValue, value),
    [savedValue, value],
  );

  function updateField<K extends keyof typeof value>(
    field: K,
    fieldValue: (typeof value)[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
    clearField(field);
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    const fieldErrors = getOverviewFieldErrors(value);

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
        setError(result.error ?? "Failed to save overview.");
        return;
      }

      setSuccess("Overview saved.");
      onSaved?.();
    } catch {
      setError("Failed to save overview.");
    }
  }

  return (
    <ProfileEditSection
      id="profile-overview"
      title="Overview"
      description="Your headline, contact details, and professional summary."
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
          id="profile-title"
          label="Headline / Current Role"
          value={value.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Senior Software Engineer"
          error={errors.title}
        />
        <FormField
          id="profile-company"
          label="Current Company"
          value={value.company}
          onChange={(event) => updateField("company", event.target.value)}
          placeholder="Acme Corp"
          error={errors.company}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormSelect
          id="profile-availability-status"
          label="Job search status"
          required
          value={value.availabilityStatus}
          onChange={(event) =>
            updateField("availabilityStatus", event.target.value)
          }
          options={[...AVAILABILITY_STATUS_OPTIONS]}
          placeholder="Select status"
          error={errors.availabilityStatus}
        />
        <FormSelect
          id="profile-availability-start"
          label="Available from"
          value={value.availabilityStart}
          onChange={(event) =>
            updateField("availabilityStart", event.target.value)
          }
          options={[...AVAILABILITY_START_OPTIONS]}
          placeholder="Select timing"
          error={errors.availabilityStart}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormField
          id="profile-total-years-experience"
          label="Total years of experience"
          type="number"
          value={value.totalYearsExperience}
          onChange={(event) =>
            updateField("totalYearsExperience", event.target.value)
          }
          placeholder="8"
          hint={`Optional. Used in recruiter search filters. Maximum ${PROFILE_FIELD_LIMITS.maxTotalYearsExperience} years.`}
          error={errors.totalYearsExperience}
        />
        <FormSelect
          id="profile-experience-level"
          label="Experience level"
          value={value.experienceLevel}
          onChange={(event) =>
            updateField("experienceLevel", event.target.value)
          }
          options={[...EXPERIENCE_LEVEL_OPTIONS]}
          placeholder="Select level"
          error={errors.experienceLevel}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormField
          id="profile-city"
          label="City"
          value={value.city}
          onChange={(event) => updateField("city", event.target.value)}
          placeholder="Melbourne"
          error={errors.city}
        />
        <FormField
          id="profile-country"
          label="Country"
          value={value.country}
          onChange={(event) => updateField("country", event.target.value)}
          placeholder="Australia"
          error={errors.country}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormField
          id="profile-phone"
          label="Phone"
          type="tel"
          value={value.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="+61 400 000 000"
          error={errors.phone}
        />
        <FormField
          id="profile-website"
          label="Website or LinkedIn"
          value={value.website}
          onChange={(event) => updateField("website", event.target.value)}
          placeholder="linkedin.com/in/you"
          error={errors.website}
        />
      </AuthFormGrid>

      <FormTextarea
        id="profile-about"
        label="About"
        value={value.about}
        onChange={(event) => updateField("about", event.target.value)}
        placeholder="Write a short professional summary..."
        rows={5}
        error={errors.about}
      />
      <p className="text-xs text-gray-500">
        {value.about.length}/{PROFILE_FIELD_LIMITS.about} characters
      </p>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
