"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AuthFormGrid,
  AuthSubmitButton,
  FormError,
  FormField,
  FormRadioGroup,
  FormSelect,
  FormSuccess,
  InfoAlert,
  TermsAgreement,
} from "@/components/auth/shared/FormFields";
import { SignupFormShell } from "@/components/auth/shared/SignupLayout";
import { CountryCityFields } from "@/components/shared/CountryCityFields";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { showRegistrationSuccessToast } from "@/lib/auth-toast";
import {
  EMPLOYEE_COUNT_OPTIONS,
  HIRES_PER_YEAR_OPTIONS,
  RECRUITER_TYPE_OPTIONS,
} from "@/lib/auth/constants";
import type { RecruiterSignupRequest, SignupApiResponse } from "@/lib/auth/types";
import {
  getRecruiterSignupFieldErrors,
  type RecruiterSignupFieldErrors,
} from "@/lib/auth/validation";
import { hasFieldErrors } from "@/lib/form/field-errors";

interface RecruiterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  position: string;
  country: string;
  city: string;
  website: string;
  employeeCount: string;
  hiresPerYear: string;
  recruiterType: string;
  agreedToTerms: boolean;
}

const initialData: RecruiterFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
  position: "",
  country: "",
  city: "",
  website: "",
  employeeCount: "",
  hiresPerYear: "",
  recruiterType: "",
  agreedToTerms: false,
};

export function RecruiterSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RecruiterFormData>(initialData);
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof RecruiterSignupFieldErrors>();
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RecruiterFormData>(
    field: K,
    value: RecruiterFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    setSuccessMessage("");
    clearField(field);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const payload: RecruiterSignupRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      city: formData.city,
      companyName: formData.companyName,
      position: formData.position,
      website: formData.website,
      employeeCount: formData.employeeCount,
      hiresPerYear: formData.hiresPerYear,
      recruiterType: formData.recruiterType,
      agreedToTerms: formData.agreedToTerms,
    };

    const fieldErrors = getRecruiterSignupFieldErrors(payload);

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as SignupApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.error ?? "Unable to create your account.");
        return;
      }

      showRegistrationSuccessToast(result.needsEmailConfirmation);

      if (result.redirectTo) {
        router.push(result.redirectTo);
        if (!result.needsEmailConfirmation) {
          router.refresh();
        }
        return;
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SignupFormShell accountType="recruiter">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {formError ? <FormError message={formError} /> : null}
        {successMessage ? (
          <FormSuccess
            title="Account created"
            message={successMessage}
          />
        ) : null}

        <AuthFormGrid>
          <FormField
            id="recruiter-firstName"
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="John"
            error={errors.firstName}
          />
          <FormField
            id="recruiter-lastName"
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
            error={errors.lastName}
          />
        </AuthFormGrid>

        <FormField
          id="recruiter-email"
          label="Business Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@company.com"
          hint="Must be a company email address"
          error={errors.email}
        />

        <FormField
          id="recruiter-password"
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          hint="Must be at least 8 characters"
          error={errors.password}
        />

        <AuthFormGrid>
          <FormField
            id="recruiter-companyName"
            label="Company Name"
            required
            value={formData.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Acme Corp"
            error={errors.companyName}
          />
          <FormField
            id="recruiter-position"
            label="Position"
            required
            value={formData.position}
            onChange={(e) => updateField("position", e.target.value)}
            placeholder="Talent Acquisition Manager"
            error={errors.position}
          />
        </AuthFormGrid>

        <CountryCityFields
          idPrefix="recruiter"
          country={formData.country}
          city={formData.city}
          onCountryChange={(value) => updateField("country", value)}
          onCityChange={(value) => updateField("city", value)}
          countryError={errors.country}
          cityError={errors.city}
        />

        <FormField
          id="recruiter-website"
          label="Company Website"
          type="url"
          required
          value={formData.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://company.com"
          error={errors.website}
        />

        <AuthFormGrid>
          <FormSelect
            id="recruiter-employeeCount"
            label="Number of Employees"
            required
            value={formData.employeeCount}
            onChange={(e) => updateField("employeeCount", e.target.value)}
            options={[...EMPLOYEE_COUNT_OPTIONS]}
            error={errors.employeeCount}
          />
          <FormSelect
            id="recruiter-hiresPerYear"
            label="Hires Per Year"
            required
            value={formData.hiresPerYear}
            onChange={(e) => updateField("hiresPerYear", e.target.value)}
            options={[...HIRES_PER_YEAR_OPTIONS]}
            error={errors.hiresPerYear}
          />
        </AuthFormGrid>

        <FormRadioGroup
          name="recruiterType"
          label="Recruiter Type"
          required
          value={formData.recruiterType}
          onChange={(value) => updateField("recruiterType", value)}
          options={[...RECRUITER_TYPE_OPTIONS]}
          error={errors.recruiterType}
        />

        <TermsAgreement
          checked={formData.agreedToTerms}
          onChange={(checked) => updateField("agreedToTerms", checked)}
          error={errors.agreedToTerms}
        />

        <InfoAlert title="Verification Required">
          <p>
            Recruiter accounts require company verification before candidate search
            access is granted. This typically takes 1-2 business days.
          </p>
        </InfoAlert>

        <AuthSubmitButton loading={isSubmitting}>
          Create Recruiter Account
        </AuthSubmitButton>
      </form>
    </SignupFormShell>
  );
}
