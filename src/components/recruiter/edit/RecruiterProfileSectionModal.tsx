"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ProfilePhotoSection } from "@/components/profile/edit/ProfilePhotoSection";
import { RECRUITER_SECTION_COPY } from "@/components/profile/edit/profile-section-content";
import type { RecruiterProfileSectionId } from "@/components/profile/edit/profile-section-content";
import { RecruiterAboutEditSection } from "@/components/recruiter/edit/RecruiterAboutEditSection";
import { RecruiterCompanyEditSection } from "@/components/recruiter/edit/RecruiterCompanyEditSection";
import { RecruiterDetailsEditSection } from "@/components/recruiter/edit/RecruiterDetailsEditSection";
import { RecruiterHiringPreferencesEditSection } from "@/components/recruiter/edit/RecruiterHiringPreferencesEditSection";
import { Modal } from "@/components/ui/Modal";
import {
  cloneRecruiterProfileEditData,
  updateRecruiterProfilePhoto,
  type RecruiterProfileEditData,
} from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { useUploadRecruiterProfilePhotoMutation } from "@/lib/query/use-recruiter-profile-mutations";

type RecruiterProfileSectionModalProps = {
  sectionId: RecruiterProfileSectionId | null;
  initialProfile: RecruiterProfileEditData;
  onClose: () => void;
  onSaved?: () => void;
};

export function RecruiterProfileSectionModal({
  sectionId,
  initialProfile,
  onClose,
  onSaved,
}: RecruiterProfileSectionModalProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(() =>
    cloneRecruiterProfileEditData(initialProfile),
  );
  const [savedProfile, setSavedProfile] = useState(() =>
    cloneRecruiterProfileEditData(initialProfile),
  );
  const uploadPhotoMutation = useUploadRecruiterProfilePhotoMutation();

  useEffect(() => {
    const nextProfile = cloneRecruiterProfileEditData(initialProfile);
    setProfile(nextProfile);
    setSavedProfile(nextProfile);
  }, [initialProfile, sectionId]);

  const detailsValue = useMemo(
    () => ({
      title: profile.title,
      phone: profile.phone,
      city: profile.city,
      country: profile.country,
    }),
    [profile],
  );

  const savedDetailsValue = useMemo(
    () => ({
      title: savedProfile.title,
      phone: savedProfile.phone,
      city: savedProfile.city,
      country: savedProfile.country,
    }),
    [savedProfile],
  );

  const companyValue = useMemo(
    () => ({
      companyName: profile.companyName,
      website: profile.website,
      city: profile.city,
      country: profile.country,
      employeeCount: profile.employeeCount,
      hiresPerYear: profile.hiresPerYear,
      recruiterType: profile.recruiterType,
    }),
    [profile],
  );

  const savedCompanyValue = useMemo(
    () => ({
      companyName: savedProfile.companyName,
      website: savedProfile.website,
      city: savedProfile.city,
      country: savedProfile.country,
      employeeCount: savedProfile.employeeCount,
      hiresPerYear: savedProfile.hiresPerYear,
      recruiterType: savedProfile.recruiterType,
    }),
    [savedProfile],
  );

  const aboutValue = useMemo(
    () => ({
      bio: profile.bio,
      specialisations: profile.specialisations,
      industries: profile.industries,
    }),
    [profile],
  );

  const savedAboutValue = useMemo(
    () => ({
      bio: savedProfile.bio,
      specialisations: savedProfile.specialisations,
      industries: savedProfile.industries,
    }),
    [savedProfile],
  );

  const preferencesValue = useMemo(
    () => ({
      preferredWorkTypeCodes: profile.preferredWorkTypeCodes,
      preferredExperienceLevels: profile.preferredExperienceLevels,
      remotePreference: profile.remotePreference,
    }),
    [profile],
  );

  const savedPreferencesValue = useMemo(
    () => ({
      preferredWorkTypeCodes: savedProfile.preferredWorkTypeCodes,
      preferredExperienceLevels: savedProfile.preferredExperienceLevels,
      remotePreference: savedProfile.remotePreference,
    }),
    [savedProfile],
  );

  function handleSaved() {
    onSaved?.();
    router.refresh();
  }

  if (!sectionId) {
    return null;
  }

  const copy = RECRUITER_SECTION_COPY[sectionId];

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
            description="Add a professional photo so candidates can recognize you."
            photoUpload={{
              upload: uploadPhotoMutation.mutateAsync.bind(uploadPhotoMutation),
              isPending: uploadPhotoMutation.isPending,
            }}
            onPhotoSaved={(profilePictureUrl) => {
              setProfile((current) =>
                updateRecruiterProfilePhoto(current, profilePictureUrl),
              );
              setSavedProfile((current) =>
                updateRecruiterProfilePhoto(current, profilePictureUrl),
              );
              handleSaved();
            }}
          />
        ) : null}

        {sectionId === "details" ? (
          <RecruiterDetailsEditSection
            email={profile.email}
            value={detailsValue}
            savedValue={savedDetailsValue}
            onChange={(value) =>
              setProfile((current) => ({ ...current, ...value }))
            }
            onSaved={() => {
              setSavedProfile((current) => ({
                ...current,
                title: profile.title,
                phone: profile.phone,
                city: profile.city,
                country: profile.country,
              }));
              handleSaved();
            }}
          />
        ) : null}

        {sectionId === "company" ? (
          <RecruiterCompanyEditSection
            value={companyValue}
            savedValue={savedCompanyValue}
            onChange={(value) =>
              setProfile((current) => ({ ...current, ...value }))
            }
            onSaved={() => {
              setSavedProfile((current) => ({
                ...current,
                companyName: profile.companyName,
                website: profile.website,
                city: profile.city,
                country: profile.country,
                employeeCount: profile.employeeCount,
                hiresPerYear: profile.hiresPerYear,
                recruiterType: profile.recruiterType,
              }));
              handleSaved();
            }}
            embedded
          />
        ) : null}

        {sectionId === "about" ? (
          <RecruiterAboutEditSection
            value={aboutValue}
            savedValue={savedAboutValue}
            onChange={(value) =>
              setProfile((current) => ({ ...current, ...value }))
            }
            onSaved={() => {
              setSavedProfile((current) => ({
                ...current,
                bio: profile.bio,
                specialisations: [...profile.specialisations],
                industries: [...profile.industries],
              }));
              handleSaved();
            }}
          />
        ) : null}

        {sectionId === "preferences" ? (
          <RecruiterHiringPreferencesEditSection
            value={preferencesValue}
            savedValue={savedPreferencesValue}
            onChange={(value) =>
              setProfile((current) => ({ ...current, ...value }))
            }
            onSaved={() => {
              setSavedProfile((current) => ({
                ...current,
                preferredWorkTypeCodes: [...profile.preferredWorkTypeCodes],
                preferredExperienceLevels: [
                  ...profile.preferredExperienceLevels,
                ],
                remotePreference: profile.remotePreference,
              }));
              handleSaved();
            }}
            embedded
          />
        ) : null}
      </div>
    </Modal>
  );
}
