"use client";

import { useEffect, useMemo, useState } from "react";

import { RecruiterAboutEditSection } from "@/components/recruiter/edit/RecruiterAboutEditSection";
import { RecruiterCompanyEditSection } from "@/components/recruiter/edit/RecruiterCompanyEditSection";
import { RecruiterDetailsEditSection } from "@/components/recruiter/edit/RecruiterDetailsEditSection";
import { RecruiterHiringPreferencesEditSection } from "@/components/recruiter/edit/RecruiterHiringPreferencesEditSection";
import { ProfileEditBackButton } from "@/components/profile/edit/ProfileEditBackButton";
import { ProfilePhotoSection } from "@/components/profile/edit/ProfilePhotoSection";
import {
  cloneRecruiterProfileEditData,
  updateRecruiterProfilePhoto,
  type RecruiterProfileEditData,
} from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { useUploadRecruiterProfilePhotoMutation } from "@/lib/query/use-recruiter-profile-mutations";

type RecruiterProfileEditorProps = {
  initialProfile: RecruiterProfileEditData;
  backHref?: string;
};

export function RecruiterProfileEditor({
  initialProfile,
  backHref,
}: RecruiterProfileEditorProps) {
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
  }, [initialProfile]);

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

  function syncDetailsSaved() {
    setSavedProfile((current) => ({
      ...current,
      title: profile.title,
      phone: profile.phone,
      city: profile.city,
      country: profile.country,
    }));
  }

  function syncCompanySaved() {
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
  }

  function syncAboutSaved() {
    setSavedProfile((current) => ({
      ...current,
      bio: profile.bio,
      specialisations: [...profile.specialisations],
      industries: [...profile.industries],
    }));
  }

  function syncPreferencesSaved() {
    setSavedProfile((current) => ({
      ...current,
      preferredWorkTypeCodes: [...profile.preferredWorkTypeCodes],
      preferredExperienceLevels: [...profile.preferredExperienceLevels],
      remotePreference: profile.remotePreference,
    }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-6">
        {backHref ? <ProfileEditBackButton href={backHref} /> : null}

        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Edit Profile
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your recruiter profile and company details. Each section saves
          independently.
        </p>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2">
        {[
          { href: "#profile-photo", label: "Photo" },
          { href: "#recruiter-details", label: "Details" },
          { href: "#recruiter-company", label: "Company" },
          { href: "#recruiter-about", label: "About" },
          { href: "#recruiter-hiring-preferences", label: "Preferences" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
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
          }}
        />

        <RecruiterDetailsEditSection
          email={profile.email}
          value={detailsValue}
          savedValue={savedDetailsValue}
          onChange={(value) =>
            setProfile((current) => ({ ...current, ...value }))
          }
          onSaved={syncDetailsSaved}
        />

        <RecruiterCompanyEditSection
          value={companyValue}
          savedValue={savedCompanyValue}
          onChange={(value) =>
            setProfile((current) => ({ ...current, ...value }))
          }
          onSaved={syncCompanySaved}
        />

        <RecruiterAboutEditSection
          value={aboutValue}
          savedValue={savedAboutValue}
          onChange={(value) =>
            setProfile((current) => ({ ...current, ...value }))
          }
          onSaved={syncAboutSaved}
        />

        <RecruiterHiringPreferencesEditSection
          value={preferencesValue}
          savedValue={savedPreferencesValue}
          onChange={(value) =>
            setProfile((current) => ({ ...current, ...value }))
          }
          onSaved={syncPreferencesSaved}
        />
      </div>
    </div>
  );
}
