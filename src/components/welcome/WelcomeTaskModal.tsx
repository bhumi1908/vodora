"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DocumentsEditSection } from "@/components/profile/edit/DocumentsEditSection";
import { ExperienceEditSection } from "@/components/profile/edit/ExperienceEditSection";
import { ProfilePhotoSection } from "@/components/profile/edit/ProfilePhotoSection";
import {
  cloneProfileEditData,
  updateProfilePhoto,
} from "@/components/profile/edit/profile-edit-utils";
import { SkillsEditSection } from "@/components/profile/edit/SkillsEditSection";
import type { CandidateProfileEditData } from "@/components/profile/edit/types";
import { Modal } from "@/components/ui/Modal";

export type WelcomeProfileTaskId =
  | "photo"
  | "experience"
  | "skills"
  | "documents";

const TASK_COPY: Record<
  WelcomeProfileTaskId,
  { title: string; description: string }
> = {
  photo: {
    title: "Upload Photo",
    description: "Add a professional photo so recruiters can recognize you.",
  },
  experience: {
    title: "Add Employment History",
    description: "Add your employment history and key responsibilities.",
  },
  skills: {
    title: "Add Skills",
    description:
      "Highlight technical and professional skills recruiters should know about.",
  },
  documents: {
    title: "Upload Resume or Documents",
    description: "Upload your resume and supporting documents.",
  },
};

type WelcomeTaskModalProps = {
  taskId: WelcomeProfileTaskId | null;
  initialProfile: CandidateProfileEditData;
  onClose: () => void;
  onSaved?: () => void;
};

export function WelcomeTaskModal({
  taskId,
  initialProfile,
  onClose,
  onSaved,
}: WelcomeTaskModalProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(() =>
    cloneProfileEditData(initialProfile),
  );
  const [savedProfile, setSavedProfile] = useState(() =>
    cloneProfileEditData(initialProfile),
  );

  useEffect(() => {
    const nextProfile = cloneProfileEditData(initialProfile);
    setProfile(nextProfile);
    setSavedProfile(nextProfile);
  }, [initialProfile, taskId]);

  function handleSaved() {
    onSaved?.();
    router.refresh();
  }

  function syncExperienceSaved() {
    setSavedProfile((current) => ({
      ...current,
      experience: profile.experience.map((entry) => ({ ...entry })),
    }));
    handleSaved();
  }

  function syncSkillsSaved() {
    setSavedProfile((current) => ({
      ...current,
      skills: profile.skills.map((entry) => ({ ...entry })),
    }));
    handleSaved();
  }

  function syncDocumentsSaved(
    nextDocuments: CandidateProfileEditData["documents"],
  ) {
    setSavedProfile((current) => ({
      ...current,
      documents: nextDocuments.map((entry) => ({ ...entry })),
    }));
    handleSaved();
  }

  if (!taskId) {
    return null;
  }

  const copy = TASK_COPY[taskId];

  return (
    <Modal
      open={Boolean(taskId)}
      onClose={onClose}
      title={copy.title}
      description={copy.description}
      maxWidthClassName="max-w-2xl"
    >
      <div className="[&_section]:border-0 [&_section]:p-0 [&_section>h2]:sr-only [&_section>p]:sr-only">
        {taskId === "photo" ? (
          <ProfilePhotoSection
            name={profile.name}
            avatarInitials={profile.avatarInitials}
            profilePictureUrl={profile.profilePictureUrl}
            onPhotoSaved={(profilePictureUrl) => {
              setProfile((current) =>
                updateProfilePhoto(current, profilePictureUrl),
              );
              setSavedProfile((current) =>
                updateProfilePhoto(current, profilePictureUrl),
              );
              handleSaved();
            }}
          />
        ) : null}

        {taskId === "experience" ? (
          <ExperienceEditSection
            entries={profile.experience}
            savedEntries={savedProfile.experience}
            onChange={(experience) =>
              setProfile((current) => ({ ...current, experience }))
            }
            onSaved={syncExperienceSaved}
          />
        ) : null}

        {taskId === "skills" ? (
          <SkillsEditSection
            entries={profile.skills}
            savedEntries={savedProfile.skills}
            onChange={(skills) =>
              setProfile((current) => ({ ...current, skills }))
            }
            onSaved={syncSkillsSaved}
          />
        ) : null}

        {taskId === "documents" ? (
          <DocumentsEditSection
            documents={profile.documents}
            onChange={({ documents }) =>
              setProfile((current) => ({ ...current, documents }))
            }
            onDocumentsSaved={syncDocumentsSaved}
            onProfilePictureCleared={() => {
              setProfile((current) => ({
                ...current,
                profilePictureUrl: null,
              }));
              setSavedProfile((current) => ({
                ...current,
                profilePictureUrl: null,
              }));
            }}
          />
        ) : null}
      </div>
    </Modal>
  );
}
