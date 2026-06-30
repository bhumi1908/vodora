"use client";

import { useMemo, useState } from "react";

import { FormError, FormSuccess } from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import {
  CANDIDATE_VISIBILITY_OPTIONS,
  type CandidateVisibility,
} from "@/lib/settings/candidate-visibility";
import { useSaveCandidateVisibilityMutation } from "@/lib/query/use-settings-mutations";
import { toast } from "sonner";

type ProfileVisibilitySectionProps = {
  value: CandidateVisibility;
  savedValue: CandidateVisibility;
  onChange: (value: CandidateVisibility) => void;
  onSaved: (value: CandidateVisibility) => void;
  embedded?: boolean;
};

export function ProfileVisibilitySection({
  value,
  savedValue,
  onChange,
  onSaved,
  embedded = false,
}: ProfileVisibilitySectionProps) {
  const saveMutation = useSaveCandidateVisibilityMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(() => value !== savedValue, [savedValue, value]);

  async function handleSave() {
    setError("");
    setSuccess("");

    try {
      const result = await saveMutation.mutateAsync(value);

      if (!result.success) {
        const message = result.error ?? "Could not save profile visibility.";
        setError(message);
        toast.error(message);
        return;
      }

      setSuccess("Profile visibility saved.");
      toast.success("Profile visibility saved.");
      onSaved(value);
    } catch {
      setError("Could not save profile visibility.");
      toast.error("Could not save profile visibility.");
    }
  }

  return (
    <ProfileEditSection
      id="profile-visibility"
      title="Profile Visibility"
      description="Who can find and view your profile?"
      embedded={embedded}
      footer={
        <SectionSaveButton
          label="Save visibility"
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">Profile visibility</legend>
        {CANDIDATE_VISIBILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 transition-colors hover:border-blue-500 has-[:checked]:border-blue-500 ${
              error ? "border-red-300" : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="profile-visibility"
              value={option.value}
              checked={value === option.value}
              onChange={() => {
                onChange(option.value);
                setError("");
                setSuccess("");
              }}
              className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                {option.label}
                {option.value === "recruiters_only" ? (
                  <span className="ml-1.5 font-normal text-gray-500">
                    (default)
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-sm text-gray-600">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
