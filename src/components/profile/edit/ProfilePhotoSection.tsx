"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { FormError, FormSuccess } from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { uploadProfilePhoto } from "@/components/profile/edit/profile-edit-api";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import {
  MAX_PROFILE_FILE_SIZE_LABEL,
  validateProfileFile,
} from "@/lib/profile/validation";

type ProfilePhotoSectionProps = {
  name: string;
  avatarInitials: string;
  profilePictureUrl: string | null;
  onPhotoSaved: (profilePictureUrl: string) => void;
};

export function ProfilePhotoSection({
  name,
  avatarInitials,
  profilePictureUrl,
  onPhotoSaved,
}: ProfilePhotoSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profilePictureUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateProfileFile(file, { imagesOnly: true });

    if (validationError) {
      setError(validationError);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setIsSaving(true);

    const result = await uploadProfilePhoto(file);

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      setPreviewUrl(profilePictureUrl);
      return;
    }

    setPreviewUrl(result.profilePictureUrl);
    onPhotoSaved(result.profilePictureUrl);
    setSuccess("Profile photo updated.");
  }

  return (
    <ProfileEditSection
      id="profile-photo"
      title="Profile Photo"
      description="Add a professional photo so recruiters can recognize you."
      footer={
        <SectionSaveButton
          label="Choose photo"
          loading={isSaving}
          onClick={() => inputRef.current?.click()}
        />
      }
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-gray-100 bg-gray-200">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-gray-700">
              {avatarInitials}
            </span>
          )}

          {isSaving ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Upload a clear headshot in JPEG, PNG, or WebP format (max {MAX_PROFILE_FILE_SIZE_LABEL}).
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Upload photo
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          void handleFileChange(file);
          event.target.value = "";
        }}
      />

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </ProfileEditSection>
  );
}
