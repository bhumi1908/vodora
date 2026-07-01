import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { ProfileConnectionStats } from "@/components/connections/ProfileConnectionStats";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/ui/DashboardStatCard";
import {
  getRecruiterJobApplicantsPath,
  RECRUITER_PROFILE_PATH,
  RECRUITER_PROFILE_ROLES_PATH,
  RECRUITER_SAVED_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import { env } from "@/lib/env";
import {
  formatWebsiteHref,
  formatWebsiteLabel,
  getInitials,
} from "@/lib/profile/format";
import type { RecruiterJobListItem } from "@/lib/jobs/recruiter-jobs.types";
import type { RecruiterDashboardContext } from "@/lib/recruiter/dashboard.types";

function formatVerifiedRefsLabel(count: number): string {
  return `${count} verified ref${count === 1 ? "" : "s"}`;
}

function ActiveJobPostSimpleCard({ job }: { job: RecruiterJobListItem }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div className="flex items-center gap-3 bg-gray-50 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <Briefcase className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{job.title}</p>
          <p className="text-xs text-gray-500">
            {job.applicants} applicant{job.applicants === 1 ? "" : "s"} · {job.posted}
          </p>
        </div>
        {job.urgent ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Urgent
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActiveJobPostWithNewApplicantsCard({ job }: { job: RecruiterJobListItem }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div className="flex items-center gap-3 bg-gray-50 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <Briefcase className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{job.title}</p>
          <p className="text-xs text-gray-500">
            {job.applicants} applicant{job.applicants === 1 ? "" : "s"} · {job.posted}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
          {job.newApplicantCount} new
        </span>
      </div>

      {job.recentNewApplicants.length > 0 ? (
        <div className="border-t border-gray-100 bg-white p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Recent applicants</p>
          <div className="space-y-2">
            {job.recentNewApplicants.map((applicant) => (
              <div
                key={applicant.applicationId}
                className="flex items-center gap-2.5"
              >
                {applicant.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={applicant.profilePictureUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {applicant.avatarInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {applicant.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatVerifiedRefsLabel(applicant.verifiedReferenceCount)}
                  </p>
                </div>
                <Link
                  href={getRecruiterJobApplicantsPath(job.id, applicant.applicationId)}
                  className="shrink-0 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const CANDIDATES_VIEWED_STAT = {
  label: "Candidates Viewed",
  icon: Eye,
  color: "bg-purple-50 text-purple-600",
} as const;

type RecruiterDashboardSidebarProps = {
  context: RecruiterDashboardContext;
  activeJobs: RecruiterJobListItem[];
  isJobsPending: boolean;
  hiringFasterPercent: string;
  hoursSavedThisMonth: string;
  onAddJob: () => void;
};

type RecruiterDashboardStatsProps = {
  savedCount: number;
  candidatesViewedCount: number;
  activeJobPosts: string;
  avgTimeToHire: string;
  isJobsPending: boolean;
};

export function RecruiterDashboardStats({
  savedCount,
  candidatesViewedCount,
  activeJobPosts,
  avgTimeToHire,
  isJobsPending,
}: RecruiterDashboardStatsProps) {
  return (
    <DashboardStatGrid>
      <DashboardStatCard
        label="Active Job Posts"
        value={activeJobPosts}
        icon={Briefcase}
        color="bg-blue-50 text-blue-600"
        isLoading={isJobsPending}
      />
      <DashboardStatCard
        label={CANDIDATES_VIEWED_STAT.label}
        value={String(candidatesViewedCount)}
        icon={CANDIDATES_VIEWED_STAT.icon}
        color={CANDIDATES_VIEWED_STAT.color}
      />
      <DashboardStatCard
        label="Saved Profiles"
        value={String(savedCount)}
        icon={Bookmark}
        color="bg-amber-50 text-amber-600"
        href={RECRUITER_SAVED_PATH}
      />
      <DashboardStatCard
        label="Avg. Time to Hire"
        value={avgTimeToHire}
        icon={Clock}
        color="bg-green-50 text-green-600"
        isLoading={isJobsPending}
      />
    </DashboardStatGrid>
  );
}

export function RecruiterDashboardSidebar({
  context,
  activeJobs,
  isJobsPending,
  hiringFasterPercent,
  hoursSavedThisMonth,
  onAddJob,
}: RecruiterDashboardSidebarProps) {
  const recruiterInitials = getInitials(context.firstName, context.lastName);
  const recruiterName = `${context.firstName} ${context.lastName}`.trim();
  const websiteLabel = context.website
    ? formatWebsiteLabel(context.website)
    : null;
  const websiteHref = context.website
    ? formatWebsiteHref(context.website)
    : null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Active Job Posts</h2>
          <button
            type="button"
            onClick={onAddJob}
            className="shrink-0 cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            + Add
          </button>
        </div>

        {isJobsPending ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : activeJobs.length > 0 ? (
          <div className="space-y-3">
            {activeJobs.map((job) =>
              job.newApplicantCount > 0 ? (
                <ActiveJobPostWithNewApplicantsCard key={job.id} job={job} />
              ) : (
                <ActiveJobPostSimpleCard key={job.id} job={job} />
              ),
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            No active job posts yet. Post your first role to start receiving
            applications.
          </p>
        )}

        <Link
          href={RECRUITER_PROFILE_ROLES_PATH}
          className="mt-4 block w-full rounded-xl border border-blue-200 py-2.5 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          Manage Jobs
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {context.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={context.profilePictureUrl}
                alt={recruiterName}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <span className="font-semibold text-blue-700">
                  {recruiterInitials}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">
                {recruiterName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {context.jobTitle ?? "Recruiter"}
              </p>
            </div>
          </div>
          <Link
            href={RECRUITER_PROFILE_PATH}
            aria-label="View my profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ProfileConnectionStats role="recruiter" />

        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500">
          {context.companyName ? (
            <span className="flex min-w-0 items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate">{context.companyName}</span>
            </span>
          ) : null}
          {context.location ? (
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate">{context.location}</span>
            </span>
          ) : null}
          {context.email ? (
            <span className="flex min-w-0 items-center gap-2 break-all">
              <Mail className="h-4 w-4 shrink-0 text-gray-400" />
              {context.email}
            </span>
          ) : null}
          {context.phone ? (
            <span className="flex min-w-0 items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gray-400" />
              {context.phone}
            </span>
          ) : null}
          {websiteLabel && websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-2 break-all text-blue-600 hover:underline"
            >
              <Globe className="h-4 w-4 shrink-0 text-gray-400" />
              {websiteLabel}
            </a>
          ) : null}
        </div>
      </div>

      {env.NEXT_PUBLIC_SHOW_RECENT_PLACEMENTS ? (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <TrendingUp className="mb-3 h-8 w-8 text-blue-200" />
          <p className="mb-1 font-semibold">Your hiring is</p>
          {isJobsPending ? (
            <Skeleton className="mb-1 h-10 w-28 bg-blue-500" />
          ) : (
            <p className="text-4xl font-bold">
              {hiringFasterPercent === "—"
                ? "—"
                : `${hiringFasterPercent} faster`}
            </p>
          )}
          <p className="mt-1 text-sm text-blue-100">
            {hiringFasterPercent === "—"
              ? "Complete a hire to measure your speed"
              : "than traditional reference checking"}
          </p>
          <div className="mt-4 border-t border-blue-500 pt-4">
            <p className="text-xs text-blue-200">
              Estimated time saved this month
            </p>
            {isJobsPending ? (
              <Skeleton className="mt-1 h-8 w-24 bg-blue-500" />
            ) : (
              <p className="mt-1 text-2xl font-bold">{hoursSavedThisMonth}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function RecruiterDashboardCandidatesHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">Verified Candidates</h2>
      <Link
        href={RECRUITER_SEARCH_PATH}
        className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
