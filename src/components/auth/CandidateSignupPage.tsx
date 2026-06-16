"use client";

import { Upload } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  AuthFormGrid,
  AuthSubmitButton,
  FormCheckboxGrid,
  FormField,
  FormSection,
  ImportActionButton,
  TermsAgreement,
} from "@/components/auth/shared/FormFields";
import { SignupFormShell } from "@/components/auth/shared/SignupLayout";

const workAvailabilityOptions = [
  "Full Time",
  "Part Time",
  "Contract",
  "Freelance",
  "Labour Hire",
  "Casual",
  "Remote",
  "FIFO (Fly-In Fly-Out)",
];

const linkedInIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
    />
  </svg>
);

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  profession: string;
  industry: string;
  workAvailability: string[];
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
  workAvailability: [],
  agreedToTerms: false,
};

export function CandidateSignupPage() {
  const [formData, setFormData] = useState<CandidateFormData>(initialData);
  const [availabilityError, setAvailabilityError] = useState("");

  function updateField<K extends keyof CandidateFormData>(
    field: K,
    value: CandidateFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "workAvailability") {
      setAvailabilityError("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formData.workAvailability.length === 0) {
      setAvailabilityError("Please select at least one work availability option.");
      return;
    }
  }

  return (
    <SignupFormShell accountType="candidate">
      <form onSubmit={handleSubmit} className="space-y-6">
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
          value={formData.workAvailability}
          onChange={(value) => updateField("workAvailability", value)}
          error={availabilityError}
        />

        <FormSection title="Quick Import" optional>
          <div className="space-y-3">
            <ImportActionButton icon={linkedInIcon}>
              Import LinkedIn Profile
            </ImportActionButton>
            <ImportActionButton icon={<Upload className="h-5 w-5 text-gray-500" />}>
              Upload Resume (PDF/DOC)
            </ImportActionButton>
            <ImportActionButton icon={<Upload className="h-5 w-5 text-gray-500" />}>
              Upload Profile Photo
            </ImportActionButton>
          </div>
        </FormSection>

        <TermsAgreement
          checked={formData.agreedToTerms}
          onChange={(checked) => updateField("agreedToTerms", checked)}
        />

        <AuthSubmitButton>Create Candidate Account</AuthSubmitButton>
      </form>
    </SignupFormShell>
  );
}
