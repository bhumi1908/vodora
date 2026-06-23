"use client";

import {
  AuthFormGrid,
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { ProfileMonthField } from "@/components/profile/edit/ProfileMonthField";
import {
  REFERENCE_RELATIONSHIP_OPTIONS,
  REFERENCE_TYPE_OPTIONS,
  type RequestReferenceFormData,
} from "@/components/profile/reference/types";
import type { ReferenceFieldErrors } from "@/lib/profile/reference-validation";
import { getMaxMonthInput } from "@/lib/profile/validation";

type EmploymentHistoryOption = {
  id: string;
  label: string;
};

type ReferenceRequestFormFieldsProps = {
  form: RequestReferenceFormData;
  errors: ReferenceFieldErrors;
  employmentHistoryOptions?: EmploymentHistoryOption[];
  onFieldChange: <K extends keyof RequestReferenceFormData>(
    field: K,
    value: RequestReferenceFormData[K],
  ) => void;
};

export function ReferenceRequestFormFields({
  form,
  errors,
  employmentHistoryOptions = [],
  onFieldChange,
}: ReferenceRequestFormFieldsProps) {
  const maxMonth = getMaxMonthInput();
  const employmentStartMax =
    form.employmentEnd && form.employmentEnd < maxMonth
      ? form.employmentEnd
      : maxMonth;

  return (
    <div className="space-y-4">
      <AuthFormGrid>
        <FormField
          id="reference-name"
          label="Referee name"
          required
          value={form.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          placeholder="John Doe"
          error={errors.name}
        />
        <FormField
          id="reference-title"
          label="Position"
          required
          value={form.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          placeholder="Engineering Manager"
          error={errors.title}
        />
      </AuthFormGrid>

      <FormField
        id="reference-company"
        label="Company"
        required
        value={form.company}
        onChange={(event) => onFieldChange("company", event.target.value)}
        placeholder="Company Name"
        error={errors.company}
      />

      <AuthFormGrid>
        <FormField
          id="reference-email"
          label="Referee email"
          type="email"
          required
          value={form.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          placeholder="john@company.com"
          error={errors.email}
        />
        <FormField
          id="reference-phone"
          label="Phone (optional)"
          type="tel"
          value={form.phone}
          onChange={(event) => onFieldChange("phone", event.target.value)}
          placeholder="+1 (555) 123-4567"
          error={errors.phone}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <FormSelect
          id="reference-relationship"
          label="Relationship"
          required
          value={form.relationship}
          onChange={(event) =>
            onFieldChange(
              "relationship",
              event.target.value as RequestReferenceFormData["relationship"],
            )
          }
          placeholder="Select relationship"
          options={[...REFERENCE_RELATIONSHIP_OPTIONS]}
          error={errors.relationship}
        />
        <FormSelect
          id="reference-type"
          label="Reference type"
          required
          value={form.referenceType}
          onChange={(event) =>
            onFieldChange(
              "referenceType",
              event.target.value as RequestReferenceFormData["referenceType"],
            )
          }
          options={[...REFERENCE_TYPE_OPTIONS]}
          error={errors.referenceType}
        />
      </AuthFormGrid>

      <AuthFormGrid>
        <ProfileMonthField
          id="reference-employment-start"
          label="Employment start (optional)"
          value={form.employmentStart}
          max={employmentStartMax}
          onChange={(event) =>
            onFieldChange("employmentStart", event.target.value)
          }
          error={errors.employmentStart}
        />
        <ProfileMonthField
          id="reference-employment-end"
          label="Employment end (optional)"
          value={form.employmentEnd}
          min={form.employmentStart || undefined}
          onChange={(event) => onFieldChange("employmentEnd", event.target.value)}
          error={errors.employmentEnd}
        />
      </AuthFormGrid>

      {employmentHistoryOptions.length > 0 ? (
        <FormSelect
          id="reference-employment-history"
          label="Link to employment history (optional)"
          value={form.employmentHistoryId}
          onChange={(event) =>
            onFieldChange("employmentHistoryId", event.target.value)
          }
          placeholder="Select a role from your profile"
          options={employmentHistoryOptions.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
          error={errors.employmentHistoryId}
        />
      ) : null}

      <FormTextarea
        id="reference-message"
        label="Message (optional)"
        value={form.message}
        onChange={(event) => onFieldChange("message", event.target.value)}
        placeholder="Add a personal message to include in the reference request email..."
        rows={4}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <input
          type="checkbox"
          checked={form.requireCompanyEmail}
          onChange={(event) =>
            onFieldChange("requireCompanyEmail", event.target.checked)
          }
          className="mt-0.5 h-4 w-4 shrink-0 rounded text-blue-600"
        />
        <span className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">
            Referee has a company email address
          </span>
          <span className="mt-1 block text-gray-600">
            When enabled, references from company email domains are verified
            automatically after submission. Turn off for testing with personal
            inboxes such as YOPmail.
          </span>
        </span>
      </label>
    </div>
  );
}
