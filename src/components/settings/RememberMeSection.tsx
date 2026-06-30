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

  return (
    <ProfileEditSection
      id="remember-me"
      title="Sign-in Preference"
      description="Choose whether future sign-ins should keep you logged in longer."
      embedded={embedded}
      footer={
        <SectionSaveButton
          label="Save preference"
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 has-[:checked]:border-blue-500">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => {
            onChange(event.target.checked);
            setError("");
            setSuccess("");
          }}
          className="mt-0.5 h-4 w-4 rounded text-blue-600"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">
            Remember me by default
          </span>
          <span className="mt-0.5 block text-sm text-gray-600">
            When enabled, your session stays active for about six months. When
            disabled, sessions expire after about two days. This applies to your
            next sign-in and refreshes your current session preference.
          </span>
        </span>
      </label>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
