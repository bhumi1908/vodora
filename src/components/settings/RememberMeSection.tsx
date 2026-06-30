"use client";

import { useMemo, useState } from "react";

import { FormError, FormSuccess } from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import { useSaveRememberMeMutation } from "@/lib/query/use-settings-mutations";
import { toast } from "sonner";

type RememberMeSectionProps = {
  value: boolean;
  savedValue: boolean;
  onChange: (value: boolean) => void;
  onSaved: (value: boolean) => void;
  embedded?: boolean;
};

function RememberMeFields({
  value,
  onChange,
  onSave,
  isDirty,
  isSaving,
  error,
  success,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
  error: string;
  success: string;
}) {
  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/40 p-4 transition-colors hover:bg-gray-50/80">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded text-blue-600"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">
            Remember me by default
          </span>
          <span className="mt-0.5 block text-sm text-gray-600">
            Stay signed in for about six months instead of about two days.
            Applies to your next sign-in and updates your current session
            preference.
          </span>
        </span>
      </label>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}

      <div className="flex justify-end pt-1">
        <SectionSaveButton
          label="Save preference"
          loading={isSaving}
          disabled={!isDirty}
          onClick={onSave}
        />
      </div>
    </>
  );
}

export function RememberMeSection({
  value,
  savedValue,
  onChange,
  onSaved,
  embedded = false,
}: RememberMeSectionProps) {
  const saveMutation = useSaveRememberMeMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(() => value !== savedValue, [savedValue, value]);

  function handleChange(nextValue: boolean) {
    onChange(nextValue);
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    try {
      const result = await saveMutation.mutateAsync(value);

      if (!result.success) {
        const message = result.error ?? "Could not save sign-in preference.";
        setError(message);
        toast.error(message);
        return;
      }

      setSuccess("Sign-in preference saved.");
      toast.success("Sign-in preference saved.");
      onSaved(value);
    } catch {
      setError("Could not save sign-in preference.");
      toast.error("Could not save sign-in preference.");
    }
  }

  if (embedded) {
    return (
      <RememberMeFields
        value={value}
        onChange={handleChange}
        onSave={() => void handleSave()}
        isDirty={isDirty}
        isSaving={saveMutation.isPending}
        error={error}
        success={success}
      />
    );
  }

  return (
    <ProfileEditSection
      id="remember-me"
      title="Sign-in Preference"
      description="Choose whether future sign-ins should keep you logged in longer."
      footer={
        <SectionSaveButton
          label="Save preference"
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/40 p-4 transition-colors hover:bg-gray-50/80">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => handleChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded text-blue-600"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">
            Remember me by default
          </span>
          <span className="mt-0.5 block text-sm text-gray-600">
            Stay signed in for about six months instead of about two days.
            Applies to your next sign-in and updates your current session
            preference.
          </span>
        </span>
      </label>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
