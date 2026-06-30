"use client";

import { useMemo, useState } from "react";

import { AccountSecuritySection } from "@/components/settings/AccountSecuritySection";
import {
  SettingsPageLayout,
  type SettingsSection,
} from "@/components/settings/SettingsPageLayout";
import { TeamInvitationsSection } from "@/components/settings/TeamInvitationsSection";
import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";

type RecruiterSettingsPageClientProps = {
  initialInvitations: CompanyInvitationRecord[];
  initialRememberMe: boolean;
  email: string;
  emailVerified: boolean;
  defaultSectionId?: string;
};

export function RecruiterSettingsPageClient({
  initialInvitations,
  initialRememberMe,
  email,
  emailVerified,
  defaultSectionId,
}: RecruiterSettingsPageClientProps) {
  const [rememberMe, setRememberMe] = useState(initialRememberMe);
  const [savedRememberMe, setSavedRememberMe] = useState(initialRememberMe);

  const sections = useMemo<SettingsSection[]>(
    () => [
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
        id: "team-invitations",
        label: "Team & Invitations",
        description:
          "Invite colleagues by email, view pending invitations, and assign roles.",
        contentMaxWidth: "narrow",
        content: (
          <TeamInvitationsSection
            embedded
            initialInvitations={initialInvitations}
          />
        ),
      },
    ],
    [email, emailVerified, initialInvitations, rememberMe, savedRememberMe],
  );

  return (
    <SettingsPageLayout
      sections={sections}
      defaultSectionId={defaultSectionId}
    />
  );
}
