"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  CheckCircle,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { CollectReferenceTab } from "@/components/recruiter/CollectReferenceTab";
import { RecruiterActiveRolesTab } from "@/components/recruiter/RecruiterActiveRolesTab";
import {
  useMyRecruiterProfileLoading,
  useRequiredMyRecruiterProfileData,
} from "@/components/recruiter/MyRecruiterProfileDataProvider";
import { RecruiterProfileSkeleton } from "@/components/recruiter/RecruiterProfileSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  RECRUITER_PROFILE_EDIT_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import { formatRecruiterJobStatsForDisplay } from "@/lib/jobs/format-recruiter-job-stats";
import {
  formatWebsiteHref,
  formatWebsiteLabel,
} from "@/lib/profile/format";
import { useRecruiterJobsQuery } from "@/lib/query/use-job-queries";
import {
  RECRUITER_PROFILE_STATIC_RECENT_PLACEMENTS,
} from "@/lib/recruiter/recruiter-profile-static-data";
import { transformOwnRecruiterProfileToView } from "@/lib/recruiter/transform-own-recruiter-profile";

type RecruiterProfileTab = "overview" | "roles" | "collect";

function getInitialProfileTab(
  tabParam: string | null,
): RecruiterProfileTab {
  if (tabParam === "roles" || tabParam === "collect") {
    return tabParam;
  }

  return "overview";
}

export function RecruiterProfilePage() {
  const searchParams = useSearchParams();
  const rawProfile = useRequiredMyRecruiterProfileData();
  const isLoading = useMyRecruiterProfileLoading();
  const { data: recruiterJobsData, isPending: isJobsPending } =
    useRecruiterJobsQuery();
  const profile = useMemo(
    () => transformOwnRecruiterProfileToView(rawProfile),
    [rawProfile],
  );
  const jobStats = useMemo(
    () =>
      formatRecruiterJobStatsForDisplay(
        recruiterJobsData?.stats ?? {
          totalPlacements: 0,
          activeRoles: 0,
          candidatesWorkedWith: 0,
          avgTimeToHireDays: null,
          hiringFasterPercent: null,
          hoursSavedThisMonth: 0,
        },
      ),
    [recruiterJobsData?.stats],
  );
  const [activeTab, setActiveTab] = useState<RecruiterProfileTab>(() =>
    getInitialProfileTab(searchParams.get("tab")),
  );

  if (isLoading || !profile) {
    return <RecruiterProfileSkeleton />;
  }

  const websiteLabel = profile.website
    ? formatWebsiteLabel(profile.website)
    : null;
  const websiteHref = profile.website
    ? formatWebsiteHref(profile.website)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-8">
      <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-24 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 sm:h-32" />
        <div className="px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <div className="-mt-12 mb-5 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-100 shadow-lg sm:h-28 sm:w-28">
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
            <div className="flex w-full flex-col gap-2 sm:mb-1 sm:w-auto sm:flex-row">
              <Link
                href={RECRUITER_PROFILE_EDIT_PATH}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:justify-start"
              >
                <Edit className="h-4 w-4 shrink-0" />
                Edit Profile
              </Link>
              <Link
                href={RECRUITER_SEARCH_PATH}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:justify-start"
              >
                <Users className="h-4 w-4 shrink-0" />
                Find Candidates
              </Link>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {profile.name}
              </h1>
              {profile.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs text-green-700">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Verified Recruiter
                </span>
              ) : null}
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
              <span className="flex min-w-0 items-center gap-1.5 break-all">
                <Mail className="h-4 w-4 shrink-0" />
                {profile.email}
              </span>
              {profile.phone ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0" />
                  {profile.phone}
                </span>
              ) : null}
              {websiteLabel && websiteHref ? (
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
            {isJobsPending ? (
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
            {(
              [
                { id: "overview", label: "Overview", shortLabel: "Overview" },
                { id: "roles", label: "Active Roles", shortLabel: "Roles" },
                {
                  id: "collect",
                  label: "Collect a Reference",
                  shortLabel: "Reference",
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-6 sm:py-4 lg:px-8 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" ? (
            <div className="space-y-8">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>
                {profile.bio ? (
                  <p className="leading-relaxed text-gray-600">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-gray-400">
                    No bio added yet.{" "}
                    <Link
                      href={RECRUITER_PROFILE_EDIT_PATH}
                      className="text-blue-600 hover:underline"
                    >
                      Add your bio
                    </Link>
                  </p>
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
                      No specialisations added yet.{" "}
                      <Link
                        href={RECRUITER_PROFILE_EDIT_PATH}
                        className="text-blue-600 hover:underline"
                      >
                        Add specialisations
                      </Link>
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
                    <p className="text-sm text-gray-400">
                      No industries added yet.{" "}
                      <Link
                        href={RECRUITER_PROFILE_EDIT_PATH}
                        className="text-blue-600 hover:underline"
                      >
                        Add industries
                      </Link>
                    </p>
                  )}
                </div>
              </div>

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
                        <p className="truncate text-sm font-medium text-gray-900">
                          {placement.name} → {placement.company}
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
            </div>
          ) : null}

          {activeTab === "roles" ? (
            <RecruiterActiveRolesTab
              defaultCompanyName={profile.company ?? ""}
            />
          ) : null}

          {activeTab === "collect" ? (
            <CollectReferenceTab
              recruiterName={profile.name}
              companyName={profile.company}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
