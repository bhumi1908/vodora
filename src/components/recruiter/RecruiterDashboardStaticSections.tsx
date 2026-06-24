import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  RECRUITER_PROFILE_PATH,
  RECRUITER_PROFILE_ROLES_PATH,
  RECRUITER_SAVED_PATH,
  RECRUITER_SEARCH_PATH,
} from "@/lib/auth/routes";
import { env } from "@/lib/env";
import { getInitials } from "@/lib/profile/format";
import type { RecruiterJobListItem } from "@/lib/jobs/recruiter-jobs.types";
import type { RecruiterDashboardContext } from "@/lib/recruiter/dashboard.types";

const CANDIDATES_VIEWED_STAT = {
  label: "Candidates Viewed",
  value: "148",
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
  activeJobPosts: string;
  avgTimeToHire: string;
  isJobsPending: boolean;
};

type DashboardStatItem = {
  label: string;
  value: string;
  icon: typeof Briefcase;
  color: string;
  href?: string;
  isLoading?: boolean;
};

export function RecruiterDashboardStats({
  savedCount,
  activeJobPosts,
  avgTimeToHire,
  isJobsPending,
}: RecruiterDashboardStatsProps) {
  const stats: DashboardStatItem[] = [
    {
      label: "Active Job Posts",
      value: activeJobPosts,
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
      isLoading: isJobsPending,
    },
    { ...CANDIDATES_VIEWED_STAT },
    {
      label: "Saved Profiles",
      value: String(savedCount),
      icon: Bookmark,
      color: "bg-amber-50 text-amber-600",
      href: RECRUITER_SAVED_PATH,
    },
    {
      label: "Avg. Time to Hire",
      value: avgTimeToHire,
      icon: Clock,
      color: "bg-green-50 text-green-600",
      isLoading: isJobsPending,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, href, isLoading }) => {
        const content = (
          <>
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            {isLoading ? (
              <Skeleton className="mb-1 h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </>
        );

        if (href) {
          return (
            <Link
              key={label}
              href={href}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={label}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            {content}
          </div>
        );
      })}
    </div>
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

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Active Job Posts</h2>
          <button
            type="button"
            onClick={onAddJob}
            className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
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
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="overflow-hidden rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3 bg-gray-50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.applicants} applicant{job.applicants === 1 ? "" : "s"}{" "}
                      · {job.posted}
                    </p>
                  </div>
                  {job.urgent ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Urgent
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
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
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <span className="font-semibold text-blue-700">
              {recruiterInitials}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{recruiterName}</p>
            <p className="text-xs text-gray-500">
              {context.jobTitle ?? "Recruiter"}
            </p>
          </div>
        </div>
        {context.companyName ? (
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{context.companyName}</span>
          </div>
        ) : null}
        <Link
          href={RECRUITER_PROFILE_PATH}
          className="block w-full rounded-xl border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          View My Profile
        </Link>
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
