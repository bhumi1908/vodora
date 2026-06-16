"use client";

import { FormEvent, useState } from "react";

import {
  AuthFormGrid,
  AuthSubmitButton,
  FormField,
  FormRadioGroup,
  FormSelect,
  InfoAlert,
} from "@/components/auth/shared/FormFields";
import { SignupFormShell } from "@/components/auth/shared/SignupLayout";

const employeeCountOptions = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "501-1000", label: "501-1000" },
  { value: "1000+", label: "1000+" },
];

const hiresPerYearOptions = [
  { value: "1-5", label: "1-5" },
  { value: "6-20", label: "6-20" },
  { value: "21-50", label: "21-50" },
  { value: "51-100", label: "51-100" },
  { value: "100+", label: "100+" },
];

const recruiterTypeOptions = [
  "Internal Recruiter",
  "Recruitment Agency",
  "Labour Hire Company",
  "Hiring Manager",
  "Business Owner",
];

interface RecruiterFormData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  position: string;
  country: string;
  city: string;
  website: string;
  employeeCount: string;
  hiresPerYear: string;
  recruiterType: string;
}

const initialData: RecruiterFormData = {
  firstName: "",
  lastName: "",
  email: "",
  companyName: "",
  position: "",
  country: "",
  city: "",
  website: "",
  employeeCount: "",
  hiresPerYear: "",
  recruiterType: "",
};

export function RecruiterSignupPage() {
  const [formData, setFormData] = useState<RecruiterFormData>(initialData);

  function updateField<K extends keyof RecruiterFormData>(
    field: K,
    value: RecruiterFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <SignupFormShell accountType="recruiter">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthFormGrid>
          <FormField
            id="recruiter-firstName"
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="John"
          />
          <FormField
            id="recruiter-lastName"
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
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
        />

        <AuthFormGrid>
          <FormField
            id="recruiter-companyName"
            label="Company Name"
            required
            value={formData.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Acme Corp"
          />
          <FormField
            id="recruiter-position"
            label="Position"
            required
            value={formData.position}
            onChange={(e) => updateField("position", e.target.value)}
            placeholder="Talent Acquisition Manager"
          />
        </AuthFormGrid>

        <AuthFormGrid>
          <FormField
            id="recruiter-country"
            label="Country"
            required
            value={formData.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Australia"
          />
          <FormField
            id="recruiter-city"
            label="City"
            required
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="Melbourne"
          />
        </AuthFormGrid>

        <FormField
          id="recruiter-website"
          label="Company Website"
          type="url"
          required
          value={formData.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://company.com"
        />

        <AuthFormGrid>
          <FormSelect
            id="recruiter-employeeCount"
            label="Number of Employees"
            required
            value={formData.employeeCount}
            onChange={(e) => updateField("employeeCount", e.target.value)}
            options={employeeCountOptions}
          />
          <FormSelect
            id="recruiter-hiresPerYear"
            label="Hires Per Year"
            required
            value={formData.hiresPerYear}
            onChange={(e) => updateField("hiresPerYear", e.target.value)}
            options={hiresPerYearOptions}
          />
        </AuthFormGrid>

        <FormRadioGroup
          name="recruiterType"
          label="Recruiter Type"
          required
          value={formData.recruiterType}
          onChange={(value) => updateField("recruiterType", value)}
          options={recruiterTypeOptions}
        />

        <InfoAlert title="Verification Required">
          <p>
            Recruiter accounts require company verification before candidate search
            access is granted. This typically takes 1-2 business days.
          </p>
        </InfoAlert>

        <AuthSubmitButton>Create Recruiter Account</AuthSubmitButton>
      </form>
    </SignupFormShell>
  );
}
