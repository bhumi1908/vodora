"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AuthFormGrid,
  AuthSubmitButton,
  FormCheckboxGrid,
  FormError,
  FormField,
  FormSuccess,
  TermsAgreement,
} from "@/components/auth/shared/FormFields";
import { SignupFormShell } from "@/components/auth/shared/SignupLayout";
import { showRegistrationSuccessToast } from "@/lib/auth-toast";
import { WORK_TYPE_OPTIONS } from "@/lib/auth/constants";
import type { CandidateSignupRequest, SignupApiResponse } from "@/lib/auth/types";

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  profession: string;
  industry: string;
  workTypeCodes: string[];
  agreedToTerms: boolean;
}

const initialData: CandidateFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  country: "",
  city: "",
  profession: "",
  industry: "",
  workTypeCodes: [],
  agreedToTerms: false,
};

const workAvailabilityOptions = WORK_TYPE_OPTIONS.map((option) => ({
  value: option.code,
  label: option.label,
}));

export function CandidateSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CandidateFormData>(initialData);
  const [availabilityError, setAvailabilityError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof CandidateFormData>(
    field: K,
    value: CandidateFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    setSuccessMessage("");

    if (field === "workTypeCodes") {
      setAvailabilityError("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (formData.workTypeCodes.length === 0) {
      setAvailabilityError("Please select at least one work availability option.");
      return;
    }

    setIsSubmitting(true);

    const payload: CandidateSignupRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      city: formData.city,
      profession: formData.profession,
      industry: formData.industry,
      workTypeCodes: formData.workTypeCodes,
      agreedToTerms: formData.agreedToTerms,
    };

    try {
      const response = await fetch("/api/auth/register/candidate", {
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
    <SignupFormShell accountType="candidate">
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError ? <FormError message={formError} /> : null}
        {successMessage ? (
          <FormSuccess
            title="Account created"
            message={successMessage}
          />
        ) : null}

        <AuthFormGrid>
          <FormField
            id="candidate-firstName"
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="John"
          />
          <FormField
            id="candidate-lastName"
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
          />
        </AuthFormGrid>

        <FormField
          id="candidate-email"
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@email.com"
        />

        <FormField
          id="candidate-password"
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          hint="Must be at least 8 characters"
        />

        <AuthFormGrid>
          <FormField
            id="candidate-country"
            label="Country"
            required
            value={formData.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Australia"
          />
          <FormField
            id="candidate-city"
            label="City"
            required
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Melbourne"
          />
        </AuthFormGrid>

        <AuthFormGrid>
          <FormField
            id="candidate-profession"
            label="Profession"
            required
            value={formData.profession}
            onChange={(e) => updateField("profession", e.target.value)}
            placeholder="Software Engineer"
          />
          <FormField
            id="candidate-industry"
            label="Industry"
            required
            value={formData.industry}
            onChange={(e) => updateField("industry", e.target.value)}
            placeholder="Technology"
          />
        </AuthFormGrid>

        <FormCheckboxGrid
          label="Work Availability"
          required
          options={workAvailabilityOptions}
          value={formData.workTypeCodes}
          onChange={(value) => updateField("workTypeCodes", value)}
          error={availabilityError}
        />

        <TermsAgreement
          checked={formData.agreedToTerms}
          onChange={(checked) => updateField("agreedToTerms", checked)}
        />

        <AuthSubmitButton loading={isSubmitting}>
          Create Candidate Account
        </AuthSubmitButton>
      </form>
    </SignupFormShell>
  );
}
