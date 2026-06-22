"use client";

import { useMemo, useState } from "react";

import { CandidateProfileSectionModal } from "@/components/profile/edit/CandidateProfileSectionModal";
import type { CandidateProfileEditData } from "@/components/profile/edit/types";
import type { ProfileSectionId } from "@/components/profile/edit/types";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ShareReferencesModal } from "@/components/profile/ShareReferencesModal";
import { VisitorPreviewBanner } from "@/components/profile/VisitorPreviewBanner";
import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import { resolveProfileVisibility } from "@/lib/profile/profile-visibility";
import type { CandidateProfileData } from "@/lib/profile/types";

type ProfilePageProps = {
  profile: CandidateProfileData;
  isOwnProfile?: boolean;
  recruiterView?: boolean;
  connection?: ProfileConnectionState;
  onConnectionChange?: () => void;
  editProfile?: CandidateProfileEditData | null;
};

export function ProfilePage({
  profile,
  isOwnProfile = false,
  recruiterView = false,
  connection = null,
  onConnectionChange,
  editProfile = null,
}: ProfilePageProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [visitorPreview, setVisitorPreview] = useState(false);
  const [activeEditSection, setActiveEditSection] =
    useState<ProfileSectionId | null>(null);

  const visibility = useMemo(
    () =>
      resolveProfileVisibility({
        isOwnProfile,
        visitorPreview,
        recruiterView,
        connection,
      }),
    [connection, isOwnProfile, recruiterView, visitorPreview],
  );

  function openEditSection(sectionId: ProfileSectionId) {
    setActiveEditSection(sectionId);
  }

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
      {visibility.showVisitorBanner ? (
        <VisitorPreviewBanner onExit={() => setVisitorPreview(false)} />
      ) : null}

      <ProfileHeader
        profile={profile}
        visibility={visibility}
        connection={connection}
        onConnectionChange={onConnectionChange}
        onShareClick={() => setShareModalOpen(true)}
        onEnterVisitorPreview={() => setVisitorPreview(true)}
        onExitVisitorPreview={() => setVisitorPreview(false)}
        onEditPhoto={
          visibility.showOwnerActions && editProfile
            ? () => openEditSection("photo")
            : undefined
        }
        onEditDetails={
          visibility.showOwnerActions && editProfile
            ? () => openEditSection("overview")
            : undefined
        }
      />

      <ProfileTabs
        profile={profile}
        visibility={visibility}
        onEditSection={
          visibility.showOwnerActions && editProfile
            ? openEditSection
            : undefined
        }
      />

      {visibility.showOwnerActions ? (
        <ShareReferencesModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      ) : null}

      {visibility.showOwnerActions && editProfile ? (
        <CandidateProfileSectionModal
          sectionId={activeEditSection}
          initialProfile={editProfile}
          onClose={() => setActiveEditSection(null)}
        />
      ) : null}
    </div>
  );
}
