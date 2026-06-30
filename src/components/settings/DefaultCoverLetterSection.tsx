"use client";

import { useMemo, useState } from "react";

import {
  FormError,
  FormSuccess,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { hasFieldErrors } from "@/lib/form/field-errors";
import {
  MAX_DEFAULT_COVER_LETTER_LENGTH,
  validateDefaultCoverLetter,
} from "@/lib/settings/candidate-settings-validation";
import { useSaveDefaultCoverLetterMutation } from "@/lib/query/use-settings-mutations";
import { toast } from "sonner";

type DefaultCoverLetterSectionProps = {
  value: string;
  savedValue: string;
  onChange: (value: string) => void;
  onSaved: (value: string) => void;
  embedded?: boolean;
};

export function DefaultCoverLetterSection({
  value,
  savedValue,
  onChange,
  onSaved,
  embedded = false,
}: DefaultCoverLetterSectionProps) {
  const saveMutation = useSaveDefaultCoverLetterMutation();
  const { errors, setErrors, clearField } = useFieldErrors<"defaultCoverLetter">();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(() => value !== savedValue, [savedValue, value]);

  async function handleSave() {
    const fieldError = validateDefaultCoverLetter(value);
    const fieldErrors = fieldError ? { defaultCoverLetter: fieldError } : {};

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
        const message = result.error ?? "Could not save cover letter.";
        setError(message);
        toast.error(message);
        return;
      }

      setSuccess("Default cover letter saved.");
      toast.success("Default cover letter saved.");
      onSaved(value);
    } catch {
      setError("Could not save cover letter.");
      toast.error("Could not save cover letter.");
    }
  }

  return (
    <ProfileEditSection
      id="default-cover-letter"
      title="Default Cover Letter"
      description="Write your cover letter once. It pre-fills automatically when you apply to jobs."
      embedded={embedded}
      footer={
        <SectionSaveButton
          label="Save cover letter"
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      <FormTextarea
        id="default-cover-letter-text"
        label="Cover letter"
        rows={8}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          clearField("defaultCoverLetter");
          setError("");
          setSuccess("");
        }}
        placeholder="Dear hiring manager..."
        error={errors.defaultCoverLetter}
      />
      <p className="text-xs text-gray-500">
        {value.length.toLocaleString()} /{" "}
        {MAX_DEFAULT_COVER_LETTER_LENGTH.toLocaleString()} characters
      </p>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
