import {
  Briefcase,
  Building2,
  Camera,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Share2,
} from "lucide-react";
import Link from "next/link";

import { ProfileConnectionStats } from "@/components/connections/ProfileConnectionStats";
import { CandidateProfilePeerConnectButton } from "@/components/connections/CandidateProfilePeerConnectButton";
import { RecruiterProfileConnectButton } from "@/components/connections/RecruiterProfileConnectButton";
import { ProfileCompletionCircle } from "@/components/profile/ProfileCompletionCircle";
import { ProfileSectionEditButton } from "@/components/profile/edit/ProfileSectionEditButton";
import { candidateSectionHasContent } from "@/components/profile/edit/profile-section-content";
import {
  CANDIDATE_FIND_RECRUITERS_PATH,
  CANDIDATE_JOBS_PATH,
} from "@/lib/auth/routes";
import { formatCandidateAvailability } from "@/lib/profile/availability";
import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import {
  formatWebsiteHref,
  formatWebsiteLabel,
} from "@/lib/profile/format";
import type { ProfileCompletionItem } from "@/lib/profile/profile-completion";
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
  onEditQuote?: () => void;
  quote?: string | null;
  completionPercent?: number;
  completionItems?: ProfileCompletionItem[];
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
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md">
        {profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-3xl font-semibold text-gray-700">
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
          className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
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
  onEditDetails,
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
  onEditDetails?: () => void;
  placement: ActionPlacement;
}) {
  const isMobile = placement === "mobile";
  const rowClass = isMobile
    ? "flex flex-col gap-2"
    : "flex flex-row flex-wrap items-center justify-end gap-2";
  const buttonClass = isMobile
    ? "flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors"
    : "flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors";

  if (visibility.showOwnerActions) {
    const editButton = onEditDetails ? (
      <button
        type="button"
        onClick={onEditDetails}
        className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-50`}
      >
        <Edit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Edit Profile
      </button>
    ) : (
      <Link
        href="/my-profile/edit"
        className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-50`}
      >
        <Edit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Edit Profile
      </Link>
    );

    if (isMobile) {
      return (
        <div className={rowClass}>
          {editButton}
          <button
            type="button"
            onClick={onShareClick}
            className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Share References
          </button>
          <Link
            href={CANDIDATE_JOBS_PATH}
            className={`${buttonClass} border border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
          >
            <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Search for Jobs
          </Link>
          <Link
            href={CANDIDATE_FIND_RECRUITERS_PATH}
            className={`${buttonClass} border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
          >
            <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Find Recruiters
          </Link>
          <button
            type="button"
            onClick={onEnterVisitorPreview}
            className={`${buttonClass} border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}
          >
            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Preview as Visitor
          </button>
        </div>
      );
    }

    return (
      <div className={rowClass}>
        <Link
          href={CANDIDATE_JOBS_PATH}
          className={`${buttonClass} border border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
        >
          <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Search for Jobs
        </Link>
        <Link
          href={CANDIDATE_FIND_RECRUITERS_PATH}
          className={`${buttonClass} border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Find Recruiters
        </Link>
        {editButton}
        <button
          type="button"
          onClick={onShareClick}
          className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Share References
        </button>
        <button
          type="button"
          onClick={onEnterVisitorPreview}
          className={`${buttonClass} border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}
        >
          <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
          <EyeOff className="h-3.5 w-3.5 shrink-0" />
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
  onEditQuote,
  quote,
  completionPercent,
  completionItems,
}: ProfileHeaderProps) {
  const availabilityLabel = formatCandidateAvailability(
    profile.availabilityStatus,
    profile.availabilityStart,
  );

  const showActions =
    visibility.showOwnerActions ||
    visibility.showVisitorBanner ||
    visibility.showConnectInHeader;

  const showCompletion =
    visibility.showOwnerActions &&
    completionPercent !== undefined &&
    completionItems !== undefined;

  const showQuoteArea = Boolean(quote) || visibility.showOwnerActions;

  const actionProps = {
    visibility,
    profile,
    peerView,
    connection,
    onConnectionChange,
    onShareClick,
    onEnterVisitorPreview,
    onExitVisitorPreview,
    onEditDetails,
  };

  return (
    <div className="relative z-10 mb-4 overflow-x-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative flex h-36 items-center overflow-hidden rounded-t-xl bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 px-4 py-4 sm:px-8">
        {showQuoteArea ? (
          <div className="relative ml-28 max-w-md pl-6 sm:ml-auto sm:max-w-xl lg:max-w-2xl">
            <span
              className="pointer-events-none absolute top-0 left-0 font-serif text-3xl leading-none text-white/25 select-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            {quote ? (
              <div className="group/quote relative pr-8">
                <p
                  className="line-clamp-3 text-sm leading-snug font-medium text-white/90 italic"
                  title={quote}
                >
                  {quote}
                </p>
                {onEditQuote ? (
                  <button
                    type="button"
                    onClick={onEditQuote}
                    aria-label="Edit personal quote"
                    className="absolute top-0 right-0 rounded-md p-1 text-white/70 opacity-100 transition-colors hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover/quote:opacity-100"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm leading-snug text-white/50 italic">
                Add a personal quote in Personal Spotlight to display it here.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="relative z-10 px-4 pb-6 sm:px-6">
        <div className="-mt-12 mb-4 flex items-end justify-between gap-4">
          <ProfileAvatar profile={profile} onEditPhoto={onEditPhoto} />
          {showActions ? (
            <div className="mb-1 hidden min-w-0 flex-1 md:block">
              <ProfileHeaderActions {...actionProps} placement="desktop" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="mb-0.5 text-2xl font-semibold text-gray-900">
                  {profile.name}
                </h1>
                {profile.title ? (
                  <p className="mb-1 font-medium text-gray-700">{profile.title}</p>
                ) : visibility.showOwnerActions ? (
                  <p className="mb-1 text-sm text-gray-500">
                    Add a headline or current position to complete your profile.
                  </p>
                ) : null}
              </div>
              {visibility.showOwnerActions && onEditDetails ? (
                <ProfileSectionEditButton
                  hasContent={candidateSectionHasContent("overview", profile)}
                  sectionLabel="Details"
                  onClick={onEditDetails}
                  className="shrink-0 min-h-10 md:hidden"
                />
              ) : null}
            </div>

            <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-500">
              {profile.company ? (
                <span className="flex min-w-0 items-center gap-1">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.company}</span>
                </span>
              ) : null}
              {profile.location ? (
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </span>
              ) : null}
              {visibility.showAvailability ? (
                <span className="flex min-w-0 items-center gap-1">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{availabilityLabel}</span>
                </span>
              ) : null}
              {visibility.showContactDetails && profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex min-w-0 items-center gap-1 text-blue-600 hover:underline"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{profile.email}</span>
                </a>
              ) : null}
              {visibility.showContactDetails && profile.phone ? (
                <a
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  className="flex min-w-0 items-center gap-1 text-blue-600 hover:underline"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{profile.phone}</span>
                </a>
              ) : null}
              {profile.website ? (
                <a
                  href={formatWebsiteHref(profile.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1 text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {formatWebsiteLabel(profile.website)}
                  </span>
                </a>
              ) : null}
            </div>

            {profile.skills.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : null}

            {visibility.showVodoraId && profile.vodoraId ? (
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Vodora ID: {profile.vodoraId}
              </p>
            ) : null}
          </div>

          {showCompletion ? (
            <div className="flex justify-center sm:justify-start">
              <ProfileCompletionCircle
                percent={completionPercent}
                items={completionItems}
              />
            </div>
          ) : null}
        </div>

        {showActions ? (
          <div className="mt-4 md:hidden">
            <ProfileHeaderActions {...actionProps} placement="mobile" />
          </div>
        ) : null}

        {visibility.showOwnerActions ? (
          <div className="mt-4">
            <ProfileConnectionStats role="candidate" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
