"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  Camera,
  CheckCircle,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { CandidateRecruiterConnectButton } from "@/components/connections/CandidateRecruiterConnectButton";
import { ProfileConnectionStats } from "@/components/connections/ProfileConnectionStats";
import { ProfileSectionEditButton } from "@/components/profile/edit/ProfileSectionEditButton";
import {
  recruiterSectionHasContent,
  RECRUITER_SECTION_COPY,
  type RecruiterProfileSectionId,
} from "@/components/profile/edit/profile-section-content";
import type { RecruiterProfileEditData } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import { RecruiterProfileRestrictedNotice } from "@/components/recruiter/RecruiterProfileRestrictedNotice";
import { RecruiterPublishedRolesView } from "@/components/recruiter/RecruiterPublishedRolesView";
import { Skeleton } from "@/components/ui/Skeleton";
import { env } from "@/lib/env";
import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import {
  formatWebsiteHref,
  formatWebsiteLabel,
} from "@/lib/profile/format";
import type { CandidateRecruiterHiringPreferences } from "@/lib/recruiter/candidate-recruiter-profile.types";
import type { RecruiterDirectoryActiveRole } from "@/lib/recruiter/recruiter-directory.types";
import type { RecruiterProfileData } from "@/lib/recruiter/recruiter-profile.types";
import { RECRUITER_PROFILE_STATIC_RECENT_PLACEMENTS } from "@/lib/recruiter/recruiter-profile-static-data";
import type { RecruiterProfileVisibility } from "@/lib/recruiter/recruiter-profile-visibility";

export type RecruiterProfileTab = "overview" | "roles" | "collect" | "history";

export type RecruiterProfileStatsDisplay = {
  totalPlacements: string;
  activeRoles: string;
  candidatesWorkedWith: string;
  avgTimeToHire: string;
};

type RecruiterProfileViewProps = {
  profile: RecruiterProfileData;
  visibility: RecruiterProfileVisibility;
  jobStats: RecruiterProfileStatsDisplay;
  isStatsPending?: boolean;
  activeTab: RecruiterProfileTab;
  onTabChange: (tab: RecruiterProfileTab) => void;
  availableTabs: RecruiterProfileTab[];
  editProfile?: RecruiterProfileEditData | null;
  onEditSection?: (sectionId: RecruiterProfileSectionId) => void;
  headerActions?: ReactNode;
  onPhotoEdit?: () => void;
  connection?: ProfileConnectionState | null;
  onConnectionChange?: () => void;
  recruiterId?: string;
  publishedRoles?: RecruiterDirectoryActiveRole[];
  hiringPreferences?: CandidateRecruiterHiringPreferences | null;
  activeRolesTab?: ReactNode;
  collectReferenceTab?: ReactNode;
  referenceHistoryTab?: ReactNode;
};

function renderEditButton(
  sectionId: RecruiterProfileSectionId,
  editProfile: RecruiterProfileEditData | null | undefined,
  onEditSection: ((sectionId: RecruiterProfileSectionId) => void) | undefined,
  showOwnerActions: boolean,
) {
  if (!showOwnerActions || !editProfile || !onEditSection) {
    return null;
  }

  const copy = RECRUITER_SECTION_COPY[sectionId];

  return (
    <ProfileSectionEditButton
      hasContent={recruiterSectionHasContent(sectionId, editProfile)}
      sectionLabel={copy.label}
      onClick={() => onEditSection(sectionId)}
    />
  );
}

export function RecruiterProfileView({
  profile,
  visibility,
  jobStats,
  isStatsPending = false,
  activeTab,
  onTabChange,
  availableTabs,
  editProfile = null,
  onEditSection,
  headerActions,
  onPhotoEdit,
  connection = null,
  onConnectionChange,
  recruiterId,
  publishedRoles = [],
  hiringPreferences = null,
  activeRolesTab,
  collectReferenceTab,
  referenceHistoryTab,
}: RecruiterProfileViewProps) {
  const websiteLabel = profile.website ? formatWebsiteLabel(profile.website) : null;
  const websiteHref = profile.website ? formatWebsiteHref(profile.website) : null;

  const tabLabels: Record<
    RecruiterProfileTab,
    { label: string; shortLabel: string }
  > = {
    overview: { label: "Overview", shortLabel: "Overview" },
    roles: { label: "Active Roles", shortLabel: "Roles" },
    collect: { label: "Collect a Reference", shortLabel: "Collect" },
    history: { label: "Reference History", shortLabel: "History" },
  };

  const preferences = hiringPreferences ?? {
    preferredWorkTypeCodes: editProfile?.preferredWorkTypeCodes ?? [],
    preferredExperienceLevels: editProfile?.preferredExperienceLevels ?? [],
    remotePreference: editProfile?.remotePreference ?? null,
  };

  const hasHiringPreferences =
    preferences.preferredWorkTypeCodes.length > 0 ||
    preferences.preferredExperienceLevels.length > 0 ||
    Boolean(preferences.remotePreference);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-8">
      <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-24 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 sm:h-32" />
        <div className="px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <div className="-mt-12 mb-5 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-100 shadow-lg sm:h-28 sm:w-28">
                {profile.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePictureUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-blue-700 sm:text-4xl">
                    {profile.avatarInitials}
                  </span>
                )}
              </div>
              {visibility.showOwnerActions && onPhotoEdit ? (
                <button
                  type="button"
                  onClick={onPhotoEdit}
                  aria-label={
                    profile.profilePictureUrl
                      ? "Change profile photo"
                      : "Add profile photo"
                  }
                  className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700 sm:h-9 sm:w-9"
                >
                  <Camera className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-2 sm:mb-1 sm:w-auto sm:flex-row sm:items-center">
              {visibility.showConnectInHeader && recruiterId ? (
                <CandidateRecruiterConnectButton
                  profile={profile}
                  recruiterId={recruiterId}
                  connection={connection}
                  onConnectionChange={onConnectionChange}
                />
              ) : null}
              {headerActions}
            </div>
          </div>

          {visibility.showOwnerActions ? (
            <ProfileConnectionStats role="recruiter" />
          ) : null}

          {visibility.showRestrictedNotice ? (
            <div className="mb-5">
              <RecruiterProfileRestrictedNotice />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  {profile.name}
                </h1>
                {profile.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs text-green-700">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Verified Recruiter
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {renderEditButton(
                  "details",
                  editProfile,
                  onEditSection,
                  visibility.showOwnerActions,
                )}
                {renderEditButton(
                  "company",
                  editProfile,
                  onEditSection,
                  visibility.showOwnerActions,
                )}
              </div>
            </div>
            {profile.title ? (
              <p className="mb-1 text-gray-600">{profile.title}</p>
            ) : null}
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-4">
              {profile.company ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.company}</span>
                </span>
              ) : null}
              {profile.location ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </span>
              ) : null}
              {visibility.showContactDetails && profile.email ? (
                <span className="flex min-w-0 items-center gap-1.5 break-all">
                  <Mail className="h-4 w-4 shrink-0" />
                  {profile.email}
                </span>
              ) : null}
              {visibility.showContactDetails && profile.phone ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0" />
                  {profile.phone}
                </span>
              ) : null}
              {visibility.showContactDetails && websiteLabel && websiteHref ? (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1.5 break-all text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {websiteLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          {
            icon: TrendingUp,
            label: "Total Placements",
            value: jobStats.totalPlacements,
            color: "text-blue-600 bg-blue-50",
          },
          {
            icon: Briefcase,
            label: "Active Roles",
            value: jobStats.activeRoles,
            color: "text-purple-600 bg-purple-50",
          },
          {
            icon: Users,
            label: "Candidates Worked With",
            value: jobStats.candidatesWorkedWith,
            color: "text-green-600 bg-green-50",
          },
          {
            icon: Shield,
            label: "Avg. Time to Hire",
            value: jobStats.avgTimeToHire,
            color: "text-amber-600 bg-amber-50",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-center sm:p-5"
          >
            <div
              className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl sm:mb-3 sm:h-10 sm:w-10 ${color}`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            {isStatsPending ? (
              <Skeleton className="mx-auto mb-1 h-7 w-16 sm:h-8" />
            ) : (
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
            )}
            <p className="mt-1 text-[11px] leading-tight text-gray-500 sm:text-xs">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {availableTabs.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => onTabChange(tabId)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-6 sm:py-4 lg:px-8 ${
                  activeTab === tabId
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="sm:hidden">{tabLabels[tabId].shortLabel}</span>
                <span className="hidden sm:inline">{tabLabels[tabId].label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" ? (
            <div className="space-y-8">
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">About</h2>
                  {renderEditButton(
                    "about",
                    editProfile,
                    onEditSection,
                    visibility.showOwnerActions,
                  )}
                </div>
                {profile.bio ? (
                  <p className="leading-relaxed text-gray-600">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-gray-400">No bio added yet.</p>
                )}
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Specialisations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.specialisations.length > 0 ? (
                    profile.specialisations.map((item) => (
                      <span
                        key={item}
                        className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      No specialisations added yet.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Industries
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.industries.length > 0 ? (
                    profile.industries.map((item) => (
                      <span
                        key={item}
                        className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No industries added yet.</p>
                  )}
                </div>
              </div>

              {visibility.showHiringPreferences ? (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Hiring Preferences
                    </h2>
                    {renderEditButton(
                      "preferences",
                      editProfile,
                      onEditSection,
                      visibility.showOwnerActions,
                    )}
                  </div>
                  {hasHiringPreferences ? (
                    <div className="space-y-2 text-sm text-gray-600">
                      {preferences.preferredWorkTypeCodes.length > 0 ? (
                        <p>
                          <span className="font-medium text-gray-900">
                            Work types:
                          </span>{" "}
                          {preferences.preferredWorkTypeCodes.join(", ")}
                        </p>
                      ) : null}
                      {preferences.preferredExperienceLevels.length > 0 ? (
                        <p>
                          <span className="font-medium text-gray-900">
                            Experience levels:
                          </span>{" "}
                          {preferences.preferredExperienceLevels.join(", ")}
                        </p>
                      ) : null}
                      {preferences.remotePreference ? (
                        <p>
                          <span className="font-medium text-gray-900">
                            Remote preference:
                          </span>{" "}
                          {preferences.remotePreference}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No hiring preferences set yet.
                    </p>
                  )}
                </div>
              ) : null}

              {visibility.showOwnerActions &&
              env.NEXT_PUBLIC_SHOW_RECENT_PLACEMENTS ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Recent Placements
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {RECRUITER_PROFILE_STATIC_RECENT_PLACEMENTS.map((placement) => (
                      <div
                        key={placement.name}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 sm:gap-4 sm:p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <span className="text-sm font-semibold text-blue-700">
                            {placement.avatar}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-gray-900">
                            <span className="truncate">{placement.name}</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <span className="truncate">{placement.company}</span>
                          </p>
                          <p className="text-xs text-gray-500">{placement.role}</p>
                        </div>
                        <span className="shrink-0 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          {placement.timeToHire}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === "roles" ? (
            activeRolesTab ?? <RecruiterPublishedRolesView roles={publishedRoles} />
          ) : null}

          {activeTab === "collect" ? collectReferenceTab : null}
          {activeTab === "history" ? referenceHistoryTab : null}
        </div>
      </div>
    </div>
  );
}
