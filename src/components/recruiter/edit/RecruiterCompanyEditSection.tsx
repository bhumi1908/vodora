"use client";

import { useMemo, useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormRadioGroup,
  FormSelect,
  FormSuccess,
} from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import {
  EMPLOYEE_COUNT_OPTIONS,
  HIRES_PER_YEAR_OPTIONS,
  RECRUITER_TYPE_OPTIONS,
} from "@/lib/auth/constants";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  getRecruiterCompanyFieldErrors,
  type RecruiterCompanyFieldErrors,
} from "@/lib/recruiter/profile-validation";
import { useSaveRecruiterCompanyMutation } from "@/lib/query/use-recruiter-profile-mutations";
import type { RecruiterCompanyFields } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { isRecruiterCompanyDirty } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";

type RecruiterCompanyEditSectionProps = {
  value: RecruiterCompanyFields;
  savedValue: RecruiterCompanyFields;
  onChange: (value: RecruiterCompanyFields) => void;
  onSaved?: () => void;
  embedded?: boolean;
};

export function RecruiterCompanyEditSection({
  value,
  savedValue,
  onChange,
  onSaved,
  embedded = false,
}: RecruiterCompanyEditSectionProps) {
  const saveMutation = useSaveRecruiterCompanyMutation();
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof RecruiterCompanyFieldErrors>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isRecruiterCompanyDirty(savedValue, value),
    [savedValue, value],
  );

  function updateField<K extends keyof RecruiterCompanyFields>(
    field: K,
    fieldValue: RecruiterCompanyFields[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
    clearField(field);
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    const fieldErrors = getRecruiterCompanyFieldErrors(value);

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
        setError(result.error ?? "Failed to save company details.");
        return;
      }

      setSuccess("Company details saved.");
      onSaved?.();
    } catch {
      setError("Failed to save company details.");
    }
  }

  const content = (
    <>
      <AuthFormGrid>
        <FormField
          id="recruiter-edit-company-name"
          label="Company Name"
          required
          value={value.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
          placeholder="Acme Corp"
          error={errors.companyName}
        />
        <FormField
          id="recruiter-edit-website"
          label="Company Website"
          type="url"
          required
          value={value.website}
          onChange={(event) => updateField("website", event.target.value)}
          placeholder="https://company.com"
          error={errors.website}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormField
          id="recruiter-edit-company-country"
          label="Country"
          required
          value={value.country}
          onChange={(event) => updateField("country", event.target.value)}
          placeholder="Australia"
          error={errors.country}
        />
        <FormField
          id="recruiter-edit-company-city"
          label="City"
          required
          value={value.city}
          onChange={(event) => updateField("city", event.target.value)}
          placeholder="Melbourne"
          error={errors.city}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormSelect
          id="recruiter-edit-employee-count"
          label="Number of Employees"
          required
          value={value.employeeCount}
          onChange={(event) => updateField("employeeCount", event.target.value)}
          options={[...EMPLOYEE_COUNT_OPTIONS]}
          error={errors.employeeCount}
        />
        <FormSelect
          id="recruiter-edit-hires-per-year"
          label="Hires Per Year"
          required
          value={value.hiresPerYear}
          onChange={(event) => updateField("hiresPerYear", event.target.value)}
          options={[...HIRES_PER_YEAR_OPTIONS]}
          error={errors.hiresPerYear}
        />
      </AuthFormGrid>

      <FormRadioGroup
        name="recruiter-edit-type"
        label="Recruiter Type"
        required
        value={value.recruiterType}
        onChange={(nextValue) => updateField("recruiterType", nextValue)}
        options={[...RECRUITER_TYPE_OPTIONS]}
        error={errors.recruiterType}
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
      id="recruiter-company"
      title="Company Information"
      description="Details about your company from registration. These appear on your public profile."
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
