"use client";

import { useMemo, useState } from "react";

import { AccountSecuritySection } from "@/components/settings/AccountSecuritySection";
import { DefaultCoverLetterSection } from "@/components/settings/DefaultCoverLetterSection";
import { ProfileVisibilitySection } from "@/components/settings/ProfileVisibilitySection";
import {
  SettingsPageLayout,
  type SettingsSection,
} from "@/components/settings/SettingsPageLayout";
import type { CandidateSettingsData } from "@/lib/settings/fetch-candidate-settings";
import type { CandidateVisibility } from "@/lib/settings/candidate-visibility";

type CandidateSettingsPageClientProps = {
  initialSettings: CandidateSettingsData;
  initialRememberMe: boolean;
  email: string;
  emailVerified: boolean;
  defaultSectionId?: string;
};

export function CandidateSettingsPageClient({
  initialSettings,
  initialRememberMe,
  email,
  emailVerified,
  defaultSectionId,
}: CandidateSettingsPageClientProps) {
  const [visibility, setVisibility] = useState<CandidateVisibility>(
    initialSettings.visibility,
  );
  const [savedVisibility, setSavedVisibility] = useState<CandidateVisibility>(
    initialSettings.visibility,
  );
  const [defaultCoverLetter, setDefaultCoverLetter] = useState(
    initialSettings.defaultCoverLetter,
  );
  const [savedDefaultCoverLetter, setSavedDefaultCoverLetter] = useState(
    initialSettings.defaultCoverLetter,
  );
  const [rememberMe, setRememberMe] = useState(initialRememberMe);
  const [savedRememberMe, setSavedRememberMe] = useState(initialRememberMe);

  const sections = useMemo<SettingsSection[]>(
    () => [
      {
        id: "profile-visibility",
        label: "Profile Visibility",
        description: "Who can find and view your profile?",
        contentMaxWidth: "narrow",
        content: (
          <ProfileVisibilitySection
            embedded
            value={visibility}
            savedValue={savedVisibility}
            onChange={setVisibility}
            onSaved={setSavedVisibility}
          />
        ),
      },
      {
        id: "account-security",
        label: "Account & Security",
        description:
          "Manage your email, password, and sign-in preferences in one place.",
        contentMaxWidth: "narrow",
        content: (
          <AccountSecuritySection
            email={email}
            emailVerified={emailVerified}
            rememberMe={rememberMe}
            savedRememberMe={savedRememberMe}
            onRememberMeChange={setRememberMe}
            onRememberMeSaved={setSavedRememberMe}
          />
        ),
      },
      {
        id: "default-cover-letter",
        label: "Default Cover Letter",
        description:
          "Write your cover letter once. It pre-fills automatically when you apply to jobs.",
        contentMaxWidth: "narrow",
        content: (
          <DefaultCoverLetterSection
            embedded
            value={defaultCoverLetter}
            savedValue={savedDefaultCoverLetter}
            onChange={setDefaultCoverLetter}
            onSaved={setSavedDefaultCoverLetter}
          />
        ),
      },
    ],
    [
      defaultCoverLetter,
      email,
      emailVerified,
      rememberMe,
      savedDefaultCoverLetter,
      savedRememberMe,
      savedVisibility,
      visibility,
    ],
  );

  return (
    <SettingsPageLayout
      sections={sections}
      defaultSectionId={defaultSectionId}
    />
  );
}
