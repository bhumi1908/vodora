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
import { isEducationDirty } from "@/components/profile/edit/profile-edit-dirty";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { ProfileMonthField } from "@/components/profile/edit/ProfileMonthField";
import { saveEducationSection } from "@/components/profile/edit/profile-edit-api";
import { createEmptyEducation } from "@/components/profile/edit/profile-edit-utils";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import type { EditableEducation } from "@/components/profile/edit/types";
import { validateEducationEntries } from "@/lib/profile/validation";

type EducationEditSectionProps = {
  entries: EditableEducation[];
  savedEntries: EditableEducation[];
  onChange: (entries: EditableEducation[]) => void;
  onSaved?: () => void;
};

export function EducationEditSection({
  entries,
  savedEntries,
  onChange,
  onSaved,
}: EducationEditSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDirty = useMemo(
    () => isEducationDirty(savedEntries, entries),
    [savedEntries, entries],
  );

  function updateEntry(index: number, patch: Partial<EditableEducation>) {
    onChange(
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
    setError("");
    setSuccess("");
  }

  function addEntry() {
    onChange([...entries, createEmptyEducation()]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, entryIndex) => entryIndex !== index));
  }

  async function handleSave() {
    const validationError = validateEducationEntries(entries);

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const result = await saveEducationSection(entries);

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save education.");
      return;
    }

    setSuccess("Education saved.");
    onSaved?.();
  }

  return (
    <ProfileEditSection
      id="profile-education"
      title="Education"
      description="Add degrees, certifications, or training programs."
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
          No education records yet. Add your first qualification below.
        </p>
      ) : null}

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id ?? `new-education-${index}`}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">
                Qualification {index + 1}
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
                  id={`education-degree-${index}`}
                  label="Degree / Qualification"
                  required
                  value={entry.degree}
                  onChange={(event) =>
                    updateEntry(index, { degree: event.target.value })
                  }
                  placeholder="Bachelor of Engineering"
                />
                <FormField
                  id={`education-school-${index}`}
                  label="Institution"
                  required
                  value={entry.school}
                  onChange={(event) =>
                    updateEntry(index, { school: event.target.value })
                  }
                  placeholder="University of Melbourne"
                />
              </AuthFormGrid>

              <AuthFormGrid>
                <ProfileMonthField
                  id={`education-start-${index}`}
                  label="Start Date"
                  value={entry.startDate}
                  onChange={(event) =>
                    updateEntry(index, { startDate: event.target.value })
                  }
                />
                <ProfileMonthField
                  id={`education-end-${index}`}
                  label="End Date"
                  value={entry.endDate}
                  onChange={(event) =>
                    updateEntry(index, { endDate: event.target.value })
                  }
                />
              </AuthFormGrid>

              <FormTextarea
                id={`education-description-${index}`}
                label="Details"
                value={entry.description}
                onChange={(event) =>
                  updateEntry(index, { description: event.target.value })
                }
                placeholder="Honors, focus areas, or relevant coursework..."
                rows={3}
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
        Add education
      </button>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
