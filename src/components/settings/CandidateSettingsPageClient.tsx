"use client";

import { useMemo, useState } from "react";

import { DefaultCoverLetterSection } from "@/components/settings/DefaultCoverLetterSection";
import { ProfileVisibilitySection } from "@/components/settings/ProfileVisibilitySection";
import { RememberMeSection } from "@/components/settings/RememberMeSection";
import { ResetPasswordSection } from "@/components/settings/ResetPasswordSection";
import { SettingsPageLayout, type SettingsSection } from "@/components/settings/SettingsPageLayout";
import type { CandidateSettingsData } from "@/lib/settings/fetch-candidate-settings";
import type { CandidateVisibility } from "@/lib/settings/candidate-visibility";

type CandidateSettingsPageClientProps = {
  initialSettings: CandidateSettingsData;
  initialRememberMe: boolean;
  defaultSectionId?: string;
};

export function CandidateSettingsPageClient({
  initialSettings,
  initialRememberMe,
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
        id: "remember-me",
        label: "Sign-in Preference",
        description:
          "Choose whether future sign-ins should keep you logged in longer.",
        content: (
          <RememberMeSection
            embedded
            value={rememberMe}
            savedValue={savedRememberMe}
            onChange={setRememberMe}
            onSaved={setSavedRememberMe}
          />
        ),
      },
      {
        id: "default-cover-letter",
        label: "Default Cover Letter",
        description:
          "Write your cover letter once. It pre-fills automatically when you apply to jobs.",
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
      {
        id: "reset-password",
        label: "Reset Password",
        description: "Enter a new password for your account.",
        contentMaxWidth: "narrow",
        content: <ResetPasswordSection embedded />,
      },
    ],
    [
      defaultCoverLetter,
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
