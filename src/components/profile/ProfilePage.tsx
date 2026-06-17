"use client";

import { useState } from "react";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ShareReferencesModal } from "@/components/profile/ShareReferencesModal";
import type { CandidateProfileData } from "@/lib/profile/types";

type ProfilePageProps = {
  profile: CandidateProfileData;
  isOwnProfile?: boolean;
  recruiterView?: boolean;
};

export function ProfilePage({
  profile,
  isOwnProfile = false,
  recruiterView = false,
}: ProfilePageProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        recruiterView={recruiterView}
        onShareClick={() => setShareModalOpen(true)}
      />

      <ProfileTabs profile={profile} isOwnProfile={isOwnProfile} />

      {isOwnProfile ? (
        <ShareReferencesModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
