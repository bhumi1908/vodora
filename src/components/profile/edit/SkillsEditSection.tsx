"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSelect,
  FormSuccess,
} from "@/components/auth/shared/FormFields";
import { isSkillsDirty } from "@/components/profile/edit/profile-edit-dirty";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { createEmptySkill } from "@/components/profile/edit/profile-edit-utils";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import {
  SKILL_PROFICIENCY_OPTIONS,
  type EditableSkill,
} from "@/components/profile/edit/types";
import {
  PROFILE_FIELD_LIMITS,
  validateSkillsEntries,
} from "@/lib/profile/validation";
import { useSaveSkillsMutation } from "@/lib/query/use-profile-mutations";

type SkillsEditSectionProps = {
  entries: EditableSkill[];
  savedEntries: EditableSkill[];
  onChange: (entries: EditableSkill[]) => void;
  onSaved?: () => void;
};

export function SkillsEditSection({
  entries,
  savedEntries,
  onChange,
  onSaved,
}: SkillsEditSectionProps) {
  const saveMutation = useSaveSkillsMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isSkillsDirty(savedEntries, entries),
    [savedEntries, entries],
  );

  function updateEntry(index: number, patch: Partial<EditableSkill>) {
    onChange(
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
    setError("");
    setSuccess("");
  }

  function addEntry() {
    onChange([...entries, createEmptySkill()]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, entryIndex) => entryIndex !== index));
  }

  async function handleSave() {
    const validationError = validateSkillsEntries(entries);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await saveMutation.mutateAsync(entries);

      if (!result.success) {
        setError(result.error ?? "Failed to save skills.");
        return;
      }

      setSuccess("Skills saved.");
      onSaved?.();
    } catch {
      setError("Failed to save skills.");
    }
  }

  return (
    <ProfileEditSection
      id="profile-skills"
      title="Skills"
      description="Highlight technical and professional skills recruiters should know about."
      footer={
        <SectionSaveButton
          loading={saveMutation.isPending}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">
          No skills added yet. Add your first skill below.
        </p>
      ) : null}

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id ?? `new-skill-${index}`}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">
                Skill {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>

            <AuthFormGrid>
              <FormField
                id={`skill-name-${index}`}
                label="Skill Name"
                required
                value={entry.name}
                onChange={(event) =>
                  updateEntry(index, { name: event.target.value })
                }
                placeholder="Project Management"
              />
              <FormSelect
                id={`skill-proficiency-${index}`}
                label="Proficiency"
                value={entry.proficiency}
                onChange={(event) =>
                  updateEntry(index, { proficiency: event.target.value })
                }
                options={[...SKILL_PROFICIENCY_OPTIONS]}
              />
            </AuthFormGrid>

            <FormField
              id={`skill-years-${index}`}
              label="Years of Experience"
              type="number"
              value={entry.yearsExperience}
              onChange={(event) =>
                updateEntry(index, { yearsExperience: event.target.value })
              }
              placeholder="5"
              hint={`Optional. Maximum ${PROFILE_FIELD_LIMITS.maxSkillYears} years.`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" />
        Add skill
      </button>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
