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
import { CountryCityFields } from "@/components/shared/CountryCityFields";
import { JobTitleSelect } from "@/components/shared/JobTitleSelect";
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
  showProfileSectionSaveErrorToast,
  showProfileSectionSavedToast,
} from "@/lib/profile/profile-edit-toast";
import {
  AVAILABILITY_START_OPTIONS,
  AVAILABILITY_STATUS_OPTIONS,
  isAvailabilityStartRequired,
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
  const availabilityStartRequired = isAvailabilityStartRequired(
    value.availabilityStatus,
  );

  function updateField<K extends keyof typeof value>(
    field: K,
    fieldValue: (typeof value)[K],
  ) {
    onChange({ [field]: fieldValue } as OverviewFields);
    clearField(field);
    setError("");
    setSuccess("");
  }

  function updateCountryCity(country: string, city: string) {
    onChange({ country, city } as OverviewFields);
    clearField("country");
    clearField("city");
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
        const message = result.error ?? "Failed to save overview.";
        setError(message);
        showProfileSectionSaveErrorToast("overview", message);
        return;
      }

      setSuccess("Overview saved.");
      showProfileSectionSavedToast("overview");
      onSaved?.();
    } catch {
      setError("Failed to save overview.");
      showProfileSectionSaveErrorToast("overview");
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
      <JobTitleSelect
        id="profile-job-title"
        label="Job Title"
        value={value.jobTitleId}
        onChange={(event) => updateField("jobTitleId", event.target.value)}
        error={errors.jobTitleId}
      />

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
          onChange={(event) => {
            const nextStatus = event.target.value;

            if (nextStatus === "not_looking") {
              onChange({
                ...value,
                availabilityStatus: nextStatus,
                availabilityStart: "",
              });
            } else {
              updateField("availabilityStatus", nextStatus);
            }

            clearField("availabilityStatus");
            clearField("availabilityStart");
            setError("");
            setSuccess("");
          }}
          options={[...AVAILABILITY_STATUS_OPTIONS]}
          placeholder="Select status"
          error={errors.availabilityStatus}
        />
        <FormSelect
          id="profile-availability-start"
          label="Available from"
          required={availabilityStartRequired}
          disabled={!availabilityStartRequired}
          value={value.availabilityStart}
          onChange={(event) =>
            updateField("availabilityStart", event.target.value)
          }
          options={[...AVAILABILITY_START_OPTIONS]}
          placeholder={
            availabilityStartRequired ? "Select timing" : "Not specified"
          }
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

      <CountryCityFields
        idPrefix="profile"
        country={value.country}
        city={value.city}
        onCountryChange={(nextCountry) =>
          updateCountryCity(nextCountry, "")
        }
        onCityChange={(nextCity) => updateField("city", nextCity)}
        countryError={errors.country}
        cityError={errors.city}
        required={false}
      />

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
