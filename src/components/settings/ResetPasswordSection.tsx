"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";

type ResetPasswordSectionProps = {
  embedded?: boolean;
};

export function ResetPasswordSection({ embedded = false }: ResetPasswordSectionProps) {
  return (
    <ProfileEditSection
      id="reset-password"
      title="Reset Password"
      description="Enter a new password for your account."
      embedded={embedded}
    >
      <ResetPasswordForm
        mode="session"
        showHeading={false}
        redirectOnSuccess={false}
      />
    </ProfileEditSection>
  );
}
