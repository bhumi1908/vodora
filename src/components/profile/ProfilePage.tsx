"use client";

import { useMemo, useState } from "react";

import { CandidateProfileSectionModal } from "@/components/profile/edit/CandidateProfileSectionModal";
import type { CandidateProfileEditData } from "@/components/profile/edit/types";
import type { ProfileSectionId } from "@/components/profile/edit/types";
import { ProfileEducationSection } from "@/components/profile/ProfileEducationSection";
import { ProfileExperienceSection } from "@/components/profile/ProfileExperienceSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePassionsSection } from "@/components/profile/ProfilePassionsSection";
import { ProfileRestrictedNotice } from "@/components/profile/ProfileRestrictedNotice";
import { ProfileSectionEditButton } from "@/components/profile/edit/ProfileSectionEditButton";
import {
  candidateSectionHasContent,
  CANDIDATE_SECTION_COPY,
} from "@/components/profile/edit/profile-section-content";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ShareReferencesModal } from "@/components/profile/ShareReferencesModal";
import { SpotlightSection } from "@/components/profile/spotlight/SpotlightSection";
import { VisitorPreviewBanner } from "@/components/profile/VisitorPreviewBanner";
import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import {
  computeProfileCompletion,
  partitionSpotlightBlocks,
} from "@/lib/profile/profile-completion";
import { resolveProfileVisibility } from "@/lib/profile/profile-visibility";
import type { CandidateProfileData } from "@/lib/profile/types";
import { useCandidateReferencesQuery } from "@/lib/query/use-reference-queries";

type ProfilePageProps = {
  profile: CandidateProfileData;
  isOwnProfile?: boolean;
  recruiterView?: boolean;
  peerView?: boolean;
  connection?: ProfileConnectionState;
  hasReferenceAccess?: boolean;
  isSaved?: boolean;
  onConnectionChange?: () => void;
  editProfile?: CandidateProfileEditData | null;
};

export function ProfilePage({
  profile,
  isOwnProfile = false,
  recruiterView = false,
  peerView = false,
  connection = null,
  hasReferenceAccess = false,
  isSaved = false,
  onConnectionChange,
  editProfile = null,
}: ProfilePageProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [visitorPreview, setVisitorPreview] = useState(false);
  const [requestQuoteEdit, setRequestQuoteEdit] = useState(false);
  const [activeEditSection, setActiveEditSection] =
    useState<ProfileSectionId | null>(null);

  const visibility = useMemo(
    () =>
      resolveProfileVisibility({
        isOwnProfile,
        visitorPreview,
        recruiterView,
        peerView,
        connection,
        hasReferenceAccess,
      }),
    [
      connection,
      hasReferenceAccess,
      isOwnProfile,
      peerView,
      recruiterView,
      visitorPreview,
    ],
  );

  const { quoteBlock, passionsBlocks, spotlightBlocks } = useMemo(
    () => partitionSpotlightBlocks(profile.spotlightBlocks),
    [profile.spotlightBlocks],
  );

  const { data: references = [] } = useCandidateReferencesQuery(
    visibility.showOwnerActions,
  );
  const verifiedReferenceCount = useMemo(
    () => references.filter((reference) => reference.status === "verified").length,
    [references],
  );

  const completion = useMemo(
    () =>
      computeProfileCompletion(profile, {
        verifiedReferenceCount,
      }),
    [profile, verifiedReferenceCount],
  );

  function openEditSection(sectionId: ProfileSectionId) {
    setActiveEditSection(sectionId);
  }

  function renderSectionEditButton(sectionId: ProfileSectionId) {
    if (!visibility.showOwnerActions || !editProfile) {
      return undefined;
    }

    const copy = CANDIDATE_SECTION_COPY[sectionId];

    return (
      <ProfileSectionEditButton
        hasContent={candidateSectionHasContent(sectionId, profile)}
        sectionLabel={copy.label}
        onClick={() => openEditSection(sectionId)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden px-4 py-6">
      {visibility.showVisitorBanner ? (
        <VisitorPreviewBanner onExit={() => setVisitorPreview(false)} />
      ) : null}

      <ProfileHeader
        profile={profile}
        visibility={visibility}
        recruiterView={recruiterView}
        peerView={peerView}
        connection={connection}
        isSaved={isSaved}
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
        onEditQuote={
          visibility.showOwnerActions && quoteBlock
            ? () => setRequestQuoteEdit(true)
            : undefined
        }
        quote={quoteBlock?.text ?? null}
        completionPercent={
          visibility.showOwnerActions ? completion.percent : undefined
        }
        completionItems={
          visibility.showOwnerActions ? completion.items : undefined
        }
      />

      <SpotlightSection
        blocks={spotlightBlocks}
        reservedBlocks={[
          ...(quoteBlock ? [quoteBlock] : []),
          ...passionsBlocks,
        ]}
        editable={visibility.showOwnerActions}
        requestQuoteEdit={requestQuoteEdit}
        onQuoteEditRequestHandled={() => setRequestQuoteEdit(false)}
      />

      <ProfileExperienceSection
        experience={profile.experience}
        editButton={renderSectionEditButton("experience")}
      />

      <ProfilePassionsSection
        blocks={passionsBlocks}
        allBlocks={profile.spotlightBlocks}
        editable={visibility.showOwnerActions}
      />

      <ProfileEducationSection
        education={profile.education}
        editButton={renderSectionEditButton("education")}
      />

      {visibility.showRestrictedNotice ? (
        <div className="mb-4">
          <ProfileRestrictedNotice />
        </div>
      ) : null}

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
