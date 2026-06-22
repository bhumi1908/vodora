"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DocumentsEditSection } from "@/components/profile/edit/DocumentsEditSection";
import { EducationEditSection } from "@/components/profile/edit/EducationEditSection";
import { ExperienceEditSection } from "@/components/profile/edit/ExperienceEditSection";
import { OverviewEditSection } from "@/components/profile/edit/OverviewEditSection";
import { ProfilePhotoSection } from "@/components/profile/edit/ProfilePhotoSection";
import { CANDIDATE_SECTION_COPY } from "@/components/profile/edit/profile-section-content";
import {
  cloneProfileEditData,
  updateProfilePhoto,
} from "@/components/profile/edit/profile-edit-utils";
import { SkillsEditSection } from "@/components/profile/edit/SkillsEditSection";
import type {
  CandidateProfileEditData,
  ProfileSectionId,
} from "@/components/profile/edit/types";
import { Modal } from "@/components/ui/Modal";

type CandidateProfileSectionModalProps = {
  sectionId: ProfileSectionId | null;
  initialProfile: CandidateProfileEditData;
  onClose: () => void;
  onSaved?: () => void;
};

export function CandidateProfileSectionModal({
  sectionId,
  initialProfile,
  onClose,
  onSaved,
}: CandidateProfileSectionModalProps) {
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
  }, [initialProfile, sectionId]);

  const overviewValue = useMemo(
    () => ({
      about: profile.about,
      title: profile.title,
      company: profile.company,
      phone: profile.phone,
      website: profile.website,
      city: profile.city,
      country: profile.country,
      availabilityStatus: profile.availabilityStatus,
      availabilityStart: profile.availabilityStart,
      totalYearsExperience: profile.totalYearsExperience,
      experienceLevel: profile.experienceLevel,
    }),
    [profile],
  );

  const savedOverviewValue = useMemo(
    () => ({
      about: savedProfile.about,
      title: savedProfile.title,
      company: savedProfile.company,
      phone: savedProfile.phone,
      website: savedProfile.website,
      city: savedProfile.city,
      country: savedProfile.country,
      availabilityStatus: savedProfile.availabilityStatus,
      availabilityStart: savedProfile.availabilityStart,
      totalYearsExperience: savedProfile.totalYearsExperience,
      experienceLevel: savedProfile.experienceLevel,
    }),
    [savedProfile],
  );

  function handleSaved() {
    onSaved?.();
    router.refresh();
  }

  function syncOverviewSaved() {
    setSavedProfile((current) => ({
      ...current,
      ...overviewValue,
    }));
    handleSaved();
  }

  function syncExperienceSaved() {
    setSavedProfile((current) => ({
      ...current,
      experience: profile.experience.map((entry) => ({ ...entry })),
    }));
    handleSaved();
  }

  function syncEducationSaved() {
    setSavedProfile((current) => ({
      ...current,
      education: profile.education.map((entry) => ({ ...entry })),
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

  if (!sectionId) {
    return null;
  }

  const copy = CANDIDATE_SECTION_COPY[sectionId];

  return (
    <Modal
      open={Boolean(sectionId)}
      onClose={onClose}
      title={copy.title}
      description={copy.description}
      maxWidthClassName="max-w-2xl"
    >
      <div className="[&_section]:border-0 [&_section]:p-0 [&_section>h2]:sr-only [&_section>p]:sr-only">
        {sectionId === "photo" ? (
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

        {sectionId === "overview" ? (
          <OverviewEditSection
            value={overviewValue}
            savedValue={savedOverviewValue}
            onChange={(value) =>
              setProfile((current) => ({ ...current, ...value }))
            }
            onSaved={syncOverviewSaved}
          />
        ) : null}

        {sectionId === "experience" ? (
          <ExperienceEditSection
            entries={profile.experience}
            savedEntries={savedProfile.experience}
            onChange={(experience) =>
              setProfile((current) => ({ ...current, experience }))
            }
            onSaved={syncExperienceSaved}
          />
        ) : null}

        {sectionId === "education" ? (
          <EducationEditSection
            entries={profile.education}
            savedEntries={savedProfile.education}
            onChange={(education) =>
              setProfile((current) => ({ ...current, education }))
            }
            onSaved={syncEducationSaved}
          />
        ) : null}

        {sectionId === "skills" ? (
          <SkillsEditSection
            entries={profile.skills}
            savedEntries={savedProfile.skills}
            onChange={(skills) =>
              setProfile((current) => ({ ...current, skills }))
            }
            onSaved={syncSkillsSaved}
          />
        ) : null}

        {sectionId === "documents" ? (
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
