import {
  Briefcase,
  Building2,
  Clock,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Share2,
} from "lucide-react";
import Link from "next/link";

import { formatCandidateAvailability } from "@/lib/profile/availability";
import { CANDIDATE_JOBS_PATH } from "@/lib/auth/routes";
import {
  formatWebsiteHref,
  formatWebsiteLabel,
} from "@/lib/profile/format";
import type { CandidateProfileData } from "@/lib/profile/types";

type ProfileHeaderProps = {
  profile: CandidateProfileData;
  isOwnProfile: boolean;
  recruiterView?: boolean;
  onShareClick?: () => void;
};

export function ProfileHeader({
  profile,
  isOwnProfile,
  recruiterView = false,
  onShareClick,
}: ProfileHeaderProps) {
  const availabilityLabel = formatCandidateAvailability(
    profile.availabilityStatus,
    profile.availabilityStart,
  );

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600" />

      <div className="px-6 pb-6">
        <div className="-mt-16 mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200">
            {profile.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profilePictureUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-semibold text-gray-700">
                {profile.avatarInitials}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 lg:mb-2 lg:justify-end">
            {isOwnProfile ? (
              <>
                <Link
                  href={CANDIDATE_JOBS_PATH}
                  className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <Briefcase className="h-4 w-4" />
                  Search for Jobs
                </Link>
                <Link
                  href="/recruiters"
                  className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <Search className="h-4 w-4" />
                  Find Recruiters
                </Link>
                <Link
                  href="/my-profile/edit"
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={onShareClick}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Share2 className="h-4 w-4" />
                  Share References
                </button>
              </>
            ) : recruiterView ? (
              <button
                type="button"
                disabled
                title="Connect — coming soon"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-60"
              >
                Connect
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4" />
                  Message
                </button>
                <button
                  type="button"
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Connect
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-semibold text-gray-900">
            {profile.name}
          </h1>
          {profile.title ? (
            <p className="mb-3 text-gray-600">{profile.title}</p>
          ) : (
            <p className="mb-3 text-sm text-gray-500">
              Add a headline or current position to complete your profile.
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {profile.company ? (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{profile.company}</span>
              </div>
            ) : null}
            {profile.location ? (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{availabilityLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
            {profile.phone ? (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            ) : null}
            {profile.website ? (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a
                  href={formatWebsiteHref(profile.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formatWebsiteLabel(profile.website)}
                </a>
              </div>
            ) : null}
          </div>

          {profile.vodoraId ? (
            <p className="mt-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Vodora ID: {profile.vodoraId}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
