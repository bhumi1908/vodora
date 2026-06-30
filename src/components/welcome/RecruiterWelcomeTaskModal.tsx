"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { RecruiterCompanyEditSection } from "@/components/recruiter/edit/RecruiterCompanyEditSection";
import { RecruiterHiringPreferencesEditSection } from "@/components/recruiter/edit/RecruiterHiringPreferencesEditSection";
import { RecruiterInviteTeamSection } from "@/components/recruiter/edit/RecruiterInviteTeamSection";
import {
  cloneRecruiterProfileEditData,
  type RecruiterProfileEditData,
} from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";
import { Modal } from "@/components/ui/Modal";

export type RecruiterWelcomeTaskId = "company" | "preferences" | "invite";

const TASK_COPY: Record<
  RecruiterWelcomeTaskId,
  { title: string; description: string }
> = {
  company: {
    title: "Add Company Profile",
    description: "Confirm your company details from registration.",
  },
  preferences: {
    title: "Set Hiring Preferences",
    description: "Tell us what kind of candidates you typically hire for.",
  },
  invite: {
    title: "Invite Team Members",
    description: "Add colleagues to your company workspace by email.",
  },
};

type RecruiterWelcomeTaskModalProps = {
  taskId: RecruiterWelcomeTaskId | null;
  initialProfile: RecruiterProfileEditData;
  initialInvitations: CompanyInvitationRecord[];
  onClose: () => void;
  onSaved?: () => void;
  onInvitationCreated?: (invitation: CompanyInvitationRecord) => void;
};

export function RecruiterWelcomeTaskModal({
  taskId,
  initialProfile,
  initialInvitations,
  onClose,
  onSaved,
  onInvitationCreated,
}: RecruiterWelcomeTaskModalProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(() =>
    cloneRecruiterProfileEditData(initialProfile),
  );
  const [savedProfile, setSavedProfile] = useState(() =>
    cloneRecruiterProfileEditData(initialProfile),
  );

  useEffect(() => {
    const nextProfile = cloneRecruiterProfileEditData(initialProfile);
    setProfile(nextProfile);
    setSavedProfile(nextProfile);
  }, [initialProfile, taskId]);

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
      {taskId === "company" ? (
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

      {taskId === "preferences" ? (
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
              preferredExperienceLevels: [...profile.preferredExperienceLevels],
              remotePreference: profile.remotePreference,
            }));
            handleSaved();
          }}
          embedded
        />
      ) : null}

      {taskId === "invite" ? (
        <RecruiterInviteTeamSection
          initialInvitations={initialInvitations}
          onInvitationCreated={(invitation) => {
            onInvitationCreated?.(invitation);
            router.refresh();
          }}
        />
      ) : null}
    </Modal>
  );
}
