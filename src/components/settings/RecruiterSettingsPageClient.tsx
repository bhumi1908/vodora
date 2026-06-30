"use client";

import { useMemo, useState } from "react";

import { RememberMeSection } from "@/components/settings/RememberMeSection";
import { ResetPasswordSection } from "@/components/settings/ResetPasswordSection";
import { SettingsPageLayout, type SettingsSection } from "@/components/settings/SettingsPageLayout";
import { TeamInvitationsSection } from "@/components/settings/TeamInvitationsSection";
import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";

type RecruiterSettingsPageClientProps = {
  initialInvitations: CompanyInvitationRecord[];
  initialRememberMe: boolean;
  defaultSectionId?: string;
};

export function RecruiterSettingsPageClient({
  initialInvitations,
  initialRememberMe,
  defaultSectionId,
}: RecruiterSettingsPageClientProps) {
  const [rememberMe, setRememberMe] = useState(initialRememberMe);
  const [savedRememberMe, setSavedRememberMe] = useState(initialRememberMe);

  const sections = useMemo<SettingsSection[]>(
    () => [
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
        id: "team-invitations",
        label: "Team & Invitations",
        description:
          "Invite colleagues by email, view pending invitations, and assign roles.",
        content: (
          <TeamInvitationsSection
            embedded
            initialInvitations={initialInvitations}
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
    [initialInvitations, rememberMe, savedRememberMe],
  );

  return (
    <SettingsPageLayout
      sections={sections}
      defaultSectionId={defaultSectionId}
    />
  );
}
