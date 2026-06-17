"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DocumentsEditSection } from "@/components/profile/edit/DocumentsEditSection";
import { EducationEditSection } from "@/components/profile/edit/EducationEditSection";
import { ExperienceEditSection } from "@/components/profile/edit/ExperienceEditSection";
import { OverviewEditSection } from "@/components/profile/edit/OverviewEditSection";
import { ProfilePhotoSection } from "@/components/profile/edit/ProfilePhotoSection";
import {
  cloneProfileEditData,
  updateProfilePhoto,
} from "@/components/profile/edit/profile-edit-utils";
import { SkillsEditSection } from "@/components/profile/edit/SkillsEditSection";
import type {
  CandidateProfileEditData,
  ProfileSectionId,
} from "@/components/profile/edit/types";

const SECTION_LABELS: Record<ProfileSectionId, string> = {
  photo: "Photo",
  overview: "Overview",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  documents: "Documents",
};

type CandidateProfileEditorProps = {
  initialProfile: CandidateProfileEditData;
  sections: ProfileSectionId[];
  showSectionNav?: boolean;
  onSectionSaved?: () => void;
  backHref?: string;
  title?: string;
  description?: string;
};

export function CandidateProfileEditor({
  initialProfile,
  sections,
  showSectionNav = true,
  onSectionSaved,
  backHref,
  title = "Edit Profile",
  description = "Update your professional details. Each section saves independently.",
}: CandidateProfileEditorProps) {
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
  }, [initialProfile]);

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
    }),
    [savedProfile],
  );

  function handleSaved() {
    onSectionSaved?.();
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

  function syncDocumentsSaved(nextDocuments: CandidateProfileEditData["documents"]) {
    setSavedProfile((current) => ({
      ...current,
      documents: nextDocuments.map((entry) => ({ ...entry })),
    }));
    handleSaved();
  }

  const visibleSections = useMemo(
    () => sections.filter((section) => SECTION_LABELS[section]),
    [sections],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        {backHref ? (
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to profile
          </button>
        ) : null}

        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      {showSectionNav && visibleSections.length > 1 ? (
        <nav className="mb-6 flex flex-wrap gap-2">
          {visibleSections.map((section) => (
            <a
              key={section}
              href={`#profile-${section === "photo" ? "photo" : section}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
            >
              {SECTION_LABELS[section]}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="space-y-6">
        {sections.includes("photo") ? (
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

        {sections.includes("overview") ? (
          <OverviewEditSection
            value={overviewValue}
            savedValue={savedOverviewValue}
            onChange={(value) =>
              setProfile((current) => ({ ...current, ...value }))
            }
            onSaved={syncOverviewSaved}
          />
        ) : null}

        {sections.includes("experience") ? (
          <ExperienceEditSection
            entries={profile.experience}
            savedEntries={savedProfile.experience}
            onChange={(experience) =>
              setProfile((current) => ({ ...current, experience }))
            }
            onSaved={syncExperienceSaved}
          />
        ) : null}

        {sections.includes("education") ? (
          <EducationEditSection
            entries={profile.education}
            savedEntries={savedProfile.education}
            onChange={(education) =>
              setProfile((current) => ({ ...current, education }))
            }
            onSaved={syncEducationSaved}
          />
        ) : null}

        {sections.includes("skills") ? (
          <SkillsEditSection
            entries={profile.skills}
            savedEntries={savedProfile.skills}
            onChange={(skills) =>
              setProfile((current) => ({ ...current, skills }))
            }
            onSaved={syncSkillsSaved}
          />
        ) : null}

        {sections.includes("documents") ? (
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
    </div>
  );
}

export const ALL_PROFILE_SECTIONS: ProfileSectionId[] = [
  "photo",
  "overview",
  "experience",
  "education",
  "skills",
  "documents",
];

export const WELCOME_PROFILE_SECTIONS: ProfileSectionId[] = [
  "photo",
  "experience",
  "skills",
  "documents",
];
