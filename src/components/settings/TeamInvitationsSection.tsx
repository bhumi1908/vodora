"use client";

import { RecruiterInviteTeamSection } from "@/components/recruiter/edit/RecruiterInviteTeamSection";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";

type TeamInvitationsSectionProps = {
  initialInvitations: CompanyInvitationRecord[];
  embedded?: boolean;
};

export function TeamInvitationsSection({
  initialInvitations,
  embedded = false,
}: TeamInvitationsSectionProps) {
  return (
    <ProfileEditSection
      id="team-invitations"
      title="Team & Invitations"
      description="Invite colleagues by email, view pending invitations, and assign roles."
      embedded={embedded}
    >
      <RecruiterInviteTeamSection initialInvitations={initialInvitations} />
    </ProfileEditSection>
  );
}
