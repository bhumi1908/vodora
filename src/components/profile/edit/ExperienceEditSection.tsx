"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AuthFormGrid,
  FormError,
  FormField,
  FormSuccess,
  FormTextarea,
} from "@/components/auth/shared/FormFields";
import { isExperienceDirty } from "@/components/profile/edit/profile-edit-dirty";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { ProfileMonthField } from "@/components/profile/edit/ProfileMonthField";
import { saveExperienceSection } from "@/components/profile/edit/profile-edit-api";
import { createEmptyExperience } from "@/components/profile/edit/profile-edit-utils";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import type { EditableExperience } from "@/components/profile/edit/types";
import { validateExperienceEntries } from "@/lib/profile/validation";

type ExperienceEditSectionProps = {
  entries: EditableExperience[];
  savedEntries: EditableExperience[];
  onChange: (entries: EditableExperience[]) => void;
  onSaved?: () => void;
};

export function ExperienceEditSection({
  entries,
  savedEntries,
  onChange,
  onSaved,
}: ExperienceEditSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isExperienceDirty(savedEntries, entries),
    [savedEntries, entries],
  );

  function updateEntry(index: number, patch: Partial<EditableExperience>) {
    onChange(
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
    setError("");
    setSuccess("");
  }

  function addEntry() {
    onChange([...entries, createEmptyExperience()]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, entryIndex) => entryIndex !== index));
  }

  async function handleSave() {
    const validationError = validateExperienceEntries(entries);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const result = await saveExperienceSection(entries);

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save experience.");
      return;
    }

    setSuccess("Experience saved.");
    onSaved?.();
  }

  return (
    <ProfileEditSection
      id="profile-experience"
      title="Experience"
      description="Add your employment history and key responsibilities."
      footer={
        <SectionSaveButton
          loading={isSaving}
          disabled={!isDirty}
          onClick={() => void handleSave()}
        />
      }
    >
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">
          No experience added yet. Add your first role below.
        </p>
      ) : null}

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id ?? `new-experience-${index}`}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">
                Role {index + 1}
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

            <div className="space-y-4">
              <AuthFormGrid>
                <FormField
                  id={`experience-title-${index}`}
                  label="Job Title"
                  required
                  value={entry.title}
                  onChange={(event) =>
                    updateEntry(index, { title: event.target.value })
                  }
                  placeholder="Software Engineer"
                />
                <FormField
                  id={`experience-company-${index}`}
                  label="Company"
                  required
                  value={entry.company}
                  onChange={(event) =>
                    updateEntry(index, { company: event.target.value })
                  }
                  placeholder="Acme Corp"
                />
              </AuthFormGrid>

              <FormField
                id={`experience-location-${index}`}
                label="Location"
                value={entry.location}
                onChange={(event) =>
                  updateEntry(index, { location: event.target.value })
                }
                placeholder="Melbourne, Australia"
              />

              <AuthFormGrid>
                <ProfileMonthField
                  id={`experience-start-${index}`}
                  label="Start Date"
                  required
                  value={entry.startDate}
                  onChange={(event) =>
                    updateEntry(index, { startDate: event.target.value })
                  }
                />
                <ProfileMonthField
                  id={`experience-end-${index}`}
                  label="End Date"
                  required={!entry.isCurrent}
                  disabled={entry.isCurrent}
                  value={entry.endDate}
                  onChange={(event) =>
                    updateEntry(index, { endDate: event.target.value })
                  }
                  hint={
                    entry.isCurrent
                      ? "End date is not required for your current role."
                      : undefined
                  }
                />
              </AuthFormGrid>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={entry.isCurrent}
                  onChange={(event) =>
                    updateEntry(index, {
                      isCurrent: event.target.checked,
                      endDate: event.target.checked ? "" : entry.endDate,
                    })
                  }
                  className="h-4 w-4 rounded text-blue-600"
                />
                I currently work here
              </label>

              <FormTextarea
                id={`experience-description-${index}`}
                label="Description"
                value={entry.description}
                onChange={(event) =>
                  updateEntry(index, { description: event.target.value })
                }
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" />
        Add experience
      </button>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
