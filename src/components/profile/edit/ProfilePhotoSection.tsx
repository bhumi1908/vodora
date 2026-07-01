"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { FormError, FormSuccess } from "@/components/auth/shared/FormFields";
import { ProfilePictureAvatar } from "@/components/ui/ProfilePictureAvatar";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import { SectionSaveButton } from "@/components/profile/edit/SectionSaveButton";
import {
  showProfilePhotoSaveErrorToast,
  showProfilePhotoSavedToast,
} from "@/lib/profile/profile-edit-toast";
import { useUploadProfilePhotoMutation } from "@/lib/query/use-profile-mutations";
import {
  MAX_PROFILE_FILE_SIZE_LABEL,
  validateProfileFile,
} from "@/lib/profile/validation";

type ProfilePhotoUploadResult =
  | { success: true; profilePictureUrl: string }
  | { success: false; error: string };

type ProfilePhotoUpload = {
  upload: (file: File) => Promise<ProfilePhotoUploadResult>;
  isPending: boolean;
};

type ProfilePhotoSectionProps = {
  name: string;
  avatarInitials: string;
  profilePictureUrl: string | null;
  onPhotoSaved: (profilePictureUrl: string) => void;
  description?: string;
  photoUpload?: ProfilePhotoUpload;
};

export function ProfilePhotoSection({
  name,
  avatarInitials,
  profilePictureUrl,
  onPhotoSaved,
  description = "Add a professional photo so recruiters can recognize you.",
  photoUpload,
}: ProfilePhotoSectionProps) {
  const candidateUploadMutation = useUploadProfilePhotoMutation();
  const uploadMutation = photoUpload ?? {
    upload: candidateUploadMutation.mutateAsync.bind(candidateUploadMutation),
    isPending: candidateUploadMutation.isPending,
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profilePictureUrl);
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

    try {
      const result = await uploadMutation.upload(file);

      if (!result.success) {
        setError(result.error);
        showProfilePhotoSaveErrorToast(result.error);
        setPreviewUrl(profilePictureUrl);
        return;
      }

      setPreviewUrl(result.profilePictureUrl);
      onPhotoSaved(result.profilePictureUrl);
      setSuccess("Profile photo updated.");
      showProfilePhotoSavedToast();
    } catch {
      setError("Failed to upload photo.");
      showProfilePhotoSaveErrorToast();
      setPreviewUrl(profilePictureUrl);
    }
  }

  return (
    <ProfileEditSection
      id="profile-photo"
      title="Profile Photo"
      description={description}
      footer={
        <SectionSaveButton
          label="Choose photo"
          loading={uploadMutation.isPending}
          onClick={() => inputRef.current?.click()}
        />
      }
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <ProfilePictureAvatar
            name={name}
            initials={avatarInitials}
            profilePictureUrl={previewUrl}
            containerClassName="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-gray-100 bg-blue-100"
            initialsClassName="text-3xl font-semibold text-blue-700"
          />

          {uploadMutation.isPending ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
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
            disabled={uploadMutation.isPending}
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
