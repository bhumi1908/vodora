import {
  Building2,
  Camera,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";

import { ProfileConnectionStats } from "@/components/connections/ProfileConnectionStats";
import { CandidateProfilePeerConnectButton } from "@/components/connections/CandidateProfilePeerConnectButton";
import { RecruiterProfileConnectButton } from "@/components/connections/RecruiterProfileConnectButton";
import { ProfileSectionEditButton } from "@/components/profile/edit/ProfileSectionEditButton";
import { candidateSectionHasContent } from "@/components/profile/edit/profile-section-content";
import { formatCandidateAvailability } from "@/lib/profile/availability";
import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import {
  formatWebsiteHref,
  formatWebsiteLabel,
} from "@/lib/profile/format";
import type { ProfileVisibility } from "@/lib/profile/profile-visibility";
import type { CandidateProfileData } from "@/lib/profile/types";

type ActionPlacement = "desktop" | "mobile";

type ProfileHeaderProps = {
  profile: CandidateProfileData;
  visibility: ProfileVisibility;
  peerView?: boolean;
  connection?: ProfileConnectionState;
  onConnectionChange?: () => void;
  onShareClick?: () => void;
  onEnterVisitorPreview?: () => void;
  onExitVisitorPreview?: () => void;
  onEditPhoto?: () => void;
  onEditDetails?: () => void;
};

function ProfileAvatar({
  profile,
  onEditPhoto,
}: {
  profile: CandidateProfileData;
  onEditPhoto?: () => void;
}) {
  return (
    <div className="relative shrink-0">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 sm:h-32 sm:w-32">
        {profile.profilePictureUrl ? (

          <img
            src={profile.profilePictureUrl}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl font-semibold text-gray-700 sm:text-4xl">
            {profile.avatarInitials}
          </span>
        )}
      </div>
      {onEditPhoto ? (
        <button
          type="button"
          onClick={onEditPhoto}
          aria-label={
            profile.profilePictureUrl ? "Change profile photo" : "Add profile photo"
          }
          className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700 sm:h-9 sm:w-9"
        >
          <Camera className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function ProfileHeaderActions({
  visibility,
  profile,
  peerView = false,
  connection,
  onConnectionChange,
  onShareClick,
  onEnterVisitorPreview,
  onExitVisitorPreview,
  placement,
}: {
  visibility: ProfileVisibility;
  profile: CandidateProfileData;
  peerView?: boolean;
  connection: ProfileConnectionState;
  onConnectionChange?: () => void;
  onShareClick?: () => void;
  onEnterVisitorPreview?: () => void;
  onExitVisitorPreview?: () => void;
  placement: ActionPlacement;
}) {
  const isMobile = placement === "mobile";
  const rowClass = isMobile
    ? "flex flex-col gap-2"
    : "flex flex-row flex-wrap items-center justify-end gap-2";
  const buttonClass = isMobile
    ? "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
    : "flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors";

  if (visibility.showOwnerActions) {
    return (
      <div className={rowClass}>
        <button
          type="button"
          onClick={onShareClick}
          className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <Share2 className="h-4 w-4 shrink-0" />
          Share References
        </button>
        <button
          type="button"
          onClick={onEnterVisitorPreview}
          className={`${buttonClass} border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}
        >
          <Eye className="h-4 w-4 shrink-0" />
          Preview as Visitor
        </button>
      </div>
    );
  }

  if (visibility.showVisitorBanner) {
    return (
      <div className={rowClass}>
        <button
          type="button"
          onClick={onExitVisitorPreview}
          className={`${buttonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
        >
          <EyeOff className="h-4 w-4 shrink-0" />
          Exit Visitor View
        </button>
      </div>
    );
  }

  if (visibility.showConnectInHeader) {
    return (
      <div
        className={`${rowClass} ${isMobile ? "[&_button]:w-full [&>span]:w-full [&>span]:justify-center" : ""}`}
      >
        {peerView ? (
          <CandidateProfilePeerConnectButton
            profile={profile}
            connection={connection}
            onConnectionChange={onConnectionChange}
          />
        ) : (
          <RecruiterProfileConnectButton
            profile={profile}
            connection={connection}
            onConnectionChange={onConnectionChange}
          />
        )}
      </div>
    );
  }

  return null;
}

export function ProfileHeader({
  profile,
  visibility,
  peerView = false,
  connection = null,
  onConnectionChange,
  onShareClick,
  onEnterVisitorPreview,
  onExitVisitorPreview,
  onEditPhoto,
  onEditDetails,
}: ProfileHeaderProps) {
  const availabilityLabel = formatCandidateAvailability(
    profile.availabilityStatus,
    profile.availabilityStart,
  );

  const showActions =
    visibility.showOwnerActions ||
    visibility.showVisitorBanner ||
    visibility.showConnectInHeader;

  const actionProps = {
    visibility,
    profile,
    peerView,
    connection,
    onConnectionChange,
    onShareClick,
    onEnterVisitorPreview,
    onExitVisitorPreview,
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 sm:h-32" />

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {/* Desktop: avatar + actions beside each other (image 3) */}
        <div className="-mt-12 hidden items-end justify-between gap-4 sm:-mt-16 md:flex">
          <ProfileAvatar profile={profile} onEditPhoto={onEditPhoto} />
          {showActions ? (
            <div className="mb-3 min-w-0 flex-1">
              <ProfileHeaderActions {...actionProps} placement="desktop" />
            </div>
          ) : null}
        </div>

        {/* Mobile: avatar only */}
        <div className="-mt-12 sm:-mt-16 md:hidden">
          <ProfileAvatar profile={profile} onEditPhoto={onEditPhoto} />
        </div>

        <div className="mt-4 mb-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="mb-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                {profile.name}
              </h1>
              {profile.title ? (
                <p className="mb-3 text-sm text-gray-600 sm:text-base">
                  {profile.title}
                </p>
              ) : visibility.showOwnerActions ? (
                <p className="mb-3 text-sm text-gray-500">
                  Add a headline or current position to complete your profile.
                </p>
              ) : null}
            </div>
            {visibility.showOwnerActions && onEditDetails ? (
              <ProfileSectionEditButton
                hasContent={candidateSectionHasContent("overview", profile)}
                sectionLabel="Details"
                onClick={onEditDetails}
                className="shrink-0"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:flex-wrap md:gap-4">
            {profile.company ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{profile.company}</span>
              </div>
            ) : null}
            {profile.location ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            ) : null}
            {visibility.showAvailability ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{availabilityLabel}</span>
              </div>
            ) : null}
            {visibility.showContactDetails && profile.email ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            ) : null}
            {visibility.showContactDetails && profile.phone ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{profile.phone}</span>
              </div>
            ) : null}
            {profile.website ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <Globe className="h-4 w-4 shrink-0" />
                <a
                  href={formatWebsiteHref(profile.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-blue-600 hover:underline"
                >
                  {formatWebsiteLabel(profile.website)}
                </a>
              </div>
            ) : null}
          </div>

          {visibility.showVodoraId && profile.vodoraId ? (
            <p className="mt-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Vodora ID: {profile.vodoraId}
            </p>
          ) : null}
        </div>

        {/* Mobile: stacked buttons below profile info (image 2) */}
        {showActions ? (
          <div className="mb-4 md:hidden">
            <ProfileHeaderActions {...actionProps} placement="mobile" />
          </div>
        ) : null}

        {visibility.showOwnerActions ? (
          <ProfileConnectionStats role="candidate" />
        ) : null}
      </div>
    </div>
  );
}
