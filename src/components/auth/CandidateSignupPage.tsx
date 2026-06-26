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
import { JobTitleSelect } from "@/components/shared/JobTitleSelect";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { showRegistrationSuccessToast } from "@/lib/auth-toast";
import { WORK_TYPE_OPTIONS } from "@/lib/auth/constants";
import type { CandidateSignupRequest, SignupApiResponse } from "@/lib/auth/types";
import {
  getCandidateSignupFieldErrors,
  type CandidateSignupFieldErrors,
} from "@/lib/auth/validation";
import { hasFieldErrors } from "@/lib/form/field-errors";
import type { JobTitleOptionGroup } from "@/lib/job-titles/types";

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  jobTitleId: string;
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
  jobTitleId: "",
  workTypeCodes: [],
  agreedToTerms: false,
};

const workAvailabilityOptions = WORK_TYPE_OPTIONS.map((option) => ({
  value: option.code,
  label: option.label,
}));

type CandidateSignupPageProps = {
  initialEmail?: string;
  redirectAfterSignup?: string;
  jobTitleOptionGroups?: JobTitleOptionGroup[];
};

export function CandidateSignupPage({
  initialEmail = "",
  redirectAfterSignup,
  jobTitleOptionGroups,
}: CandidateSignupPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CandidateFormData>({
    ...initialData,
    email: initialEmail.trim(),
  });
  const { errors, setErrors, clearField } =
    useFieldErrors<keyof CandidateSignupFieldErrors>();
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitedStubState, setInvitedStubState] = useState<{
    recruiterName?: string;
    companyName?: string;
  } | null>(null);
  const [isSendingSetupLink, setIsSendingSetupLink] = useState(false);
  const [setupLinkSent, setSetupLinkSent] = useState(false);

  function updateField<K extends keyof CandidateFormData>(
    field: K,
    value: CandidateFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    setSuccessMessage("");
    setInvitedStubState(null);
    setSetupLinkSent(false);
    clearField(field);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setInvitedStubState(null);
    setSetupLinkSent(false);

    const payload: CandidateSignupRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      city: formData.city,
      jobTitleId: formData.jobTitleId,
      workTypeCodes: formData.workTypeCodes,
      agreedToTerms: formData.agreedToTerms,
      ...(redirectAfterSignup ? { redirect: redirectAfterSignup } : {}),
    };

    const fieldErrors = getCandidateSignupFieldErrors(payload);

    if (hasFieldErrors(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as SignupApiResponse;

      if (!response.ok || !result.success) {
        if (result.code === "invited_reference_stub") {
          setInvitedStubState({
            recruiterName: result.recruiterName,
            companyName: result.companyName,
          });
          setFormError(
            result.error ??
              "A Vodora profile was already started for this email.",
          );
          return;
        }

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

  async function handleSendSetupLink() {
    const email = formData.email.trim();

    if (!email) {
      setFormError("Enter your email address first.");
      return;
    }

    setIsSendingSetupLink(true);
    setFormError("");
    setSetupLinkSent(false);

    try {
      const response = await fetch("/api/auth/send-invited-setup-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setFormError(result.error ?? "Unable to send password setup link.");
        return;
      }

      setSetupLinkSent(true);
    } catch {
      setFormError("Unable to send password setup link. Please try again.");
    } finally {
      setIsSendingSetupLink(false);
    }
  }

  const invitedRecruiterLabel = invitedStubState?.recruiterName
    ? invitedStubState.companyName
      ? `${invitedStubState.recruiterName} at ${invitedStubState.companyName}`
      : invitedStubState.recruiterName
    : "A Vodora recruiter";

  return (
    <SignupFormShell accountType="candidate">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {formError ? <FormError message={formError} /> : null}
        {invitedStubState ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-900">
            <p className="font-medium">
              Your profile was started by {invitedRecruiterLabel}
            </p>
            <p className="mt-2 text-blue-800">
              Set your password to access the reference being collected on your
              behalf. We can email you a secure setup link for{" "}
              <strong>{formData.email.trim()}</strong>.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleSendSetupLink()}
                disabled={isSendingSetupLink}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingSetupLink ? "Sending…" : "Send Password Setup Link"}
              </button>
              <a
                href={`/login?${new URLSearchParams({
                  email: formData.email.trim(),
                }).toString()}`}
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                Sign In Instead
              </a>
            </div>
            {setupLinkSent ? (
              <p className="mt-3 text-sm text-blue-800">
                Password setup link sent. Check your inbox.
              </p>
            ) : null}
          </div>
        ) : null}
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
            error={errors.firstName}
          />
          <FormField
            id="candidate-lastName"
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
            error={errors.lastName}
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
          error={errors.email}
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
          error={errors.password}
        />

        <AuthFormGrid>
          <FormField
            id="candidate-country"
            label="Country"
            required
            value={formData.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Australia"
            error={errors.country}
          />
          <FormField
            id="candidate-city"
            label="City"
            required
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Melbourne"
            error={errors.city}
          />
        </AuthFormGrid>

        <JobTitleSelect
          id="candidate-job-title"
          label="Job Title"
          required
          value={formData.jobTitleId}
          onChange={(event) => updateField("jobTitleId", event.target.value)}
          optionGroups={jobTitleOptionGroups}
          error={errors.jobTitleId}
        />

        <FormCheckboxGrid
          label="Work Availability"
          required
          options={workAvailabilityOptions}
          value={formData.workTypeCodes}
          onChange={(value) => updateField("workTypeCodes", value)}
          error={errors.workTypeCodes}
        />

        <TermsAgreement
          checked={formData.agreedToTerms}
          onChange={(checked) => updateField("agreedToTerms", checked)}
          error={errors.agreedToTerms}
        />

        <AuthSubmitButton loading={isSubmitting}>
          Create Candidate Account
        </AuthSubmitButton>
      </form>
    </SignupFormShell>
  );
}

