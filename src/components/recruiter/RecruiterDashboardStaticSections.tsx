import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  Eye,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import type { RecruiterDashboardContext } from "@/lib/recruiter/dashboard.types";
import { RECRUITER_SAVED_PATH, RECRUITER_SEARCH_PATH } from "@/lib/auth/routes";
import { getInitials } from "@/lib/profile/format";

const staticStats = [
  {
    label: "Active Job Posts",
    value: "3",
    icon: Briefcase,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Candidates Viewed",
    value: "148",
    icon: Eye,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Avg. Time to Hire",
    value: "11 days",
    icon: Clock,
    color: "bg-green-50 text-green-600",
  },
] as const;

const activeJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    applicants: 24,
    new: 5,
    posted: "3 days ago",
  },
  {
    id: "2",
    title: "Product Manager",
    applicants: 18,
    new: 3,
    posted: "1 week ago",
  },
  {
    id: "3",
    title: "UX Designer",
    applicants: 31,
    new: 8,
    posted: "5 days ago",
  },
] as const;

type RecruiterDashboardSidebarProps = {
  context: RecruiterDashboardContext;
};

type RecruiterDashboardStatsProps = {
  savedCount: number;
};

type DashboardStatItem = {
  label: string;
  value: string;
  icon: typeof Briefcase;
  color: string;
  href?: string;
};

export function RecruiterDashboardStats({ savedCount }: RecruiterDashboardStatsProps) {
  const stats: DashboardStatItem[] = [
    ...staticStats.slice(0, 2).map((stat) => ({ ...stat })),
    {
      label: "Saved Profiles",
      value: String(savedCount),
      icon: Bookmark,
      color: "bg-amber-50 text-amber-600",
      href: RECRUITER_SAVED_PATH,
    },
    ...staticStats.slice(2).map((stat) => ({ ...stat })),
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, href }) => {
        const content = (
          <>
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
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
              disabled
              className="text-xs font-medium text-blue-600 opacity-60"
            >
              + Add
            </button>
          </div>
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
                      {job.applicants} applicants · {job.posted}
                    </p>
                  </div>
                  {job.new > 0 ? (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {job.new} new
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-xl border border-blue-200 py-2.5 text-sm font-medium text-blue-600 opacity-60"
          >
            Manage Jobs
          </button>
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
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{context.companyName}</span>
            </div>
          ) : null}
          <div className="mb-4 flex gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-gray-500">4.8 rating</span>
          </div>
          <button
            type="button"
            disabled
            className="block w-full rounded-xl border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 opacity-60"
          >
            View My Profile
          </button>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <TrendingUp className="mb-3 h-8 w-8 text-blue-200" />
          <p className="mb-1 font-semibold">Your hiring is</p>
          <p className="text-4xl font-bold">82% faster</p>
          <p className="mt-1 text-sm text-blue-100">
            than traditional reference checking
          </p>
          <div className="mt-4 border-t border-blue-500 pt-4">
            <p className="text-xs text-blue-200">
              Estimated time saved this month
            </p>
            <p className="mt-1 text-2xl font-bold">24 hours</p>
          </div>
        </div>
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
