import { Briefcase, Pencil, Search, Users } from "lucide-react";
import Link from "next/link";

import { getRecruiterGreeting } from "@/lib/recruiter/get-recruiter-greeting";
import type { CandidateDashboardContext } from "@/lib/candidate/dashboard.types";
import {
  CANDIDATE_CONNECTIONS_PATH,
  CANDIDATE_JOBS_PATH,
  CANDIDATE_PROFILE_PATH,
} from "@/lib/auth/routes";

type CandidateDashboardHeaderProps = {
  context: CandidateDashboardContext;
};

export function CandidateDashboardHeader({ context }: CandidateDashboardHeaderProps) {
  const greeting = getRecruiterGreeting();
  const subtitle = [
    context.title,
    "Here's what's happening today",
  ].filter(Boolean);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          {greeting}, {context.firstName}
        </h1>
        <p className="mt-1 text-gray-500">{subtitle.join(" · ")}</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href={CANDIDATE_JOBS_PATH}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
        >
          <Search className="h-4 w-4" />
          Browse Jobs
        </Link>
        <Link
          href={CANDIDATE_PROFILE_PATH}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export function CandidateDashboardHeaderSkeleton() {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-100" />
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100 sm:w-32" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200 sm:w-32" />
      </div>
    </div>
  );
}

export function CandidateDashboardApplicationsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
      <Link
        href={CANDIDATE_JOBS_PATH}
        className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        Browse jobs
      </Link>
    </div>
  );
}

export function CandidateDashboardQuickLinks() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Link
        href={CANDIDATE_CONNECTIONS_PATH}
        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Connections</p>
          <p className="text-xs text-gray-500">Manage your network</p>
        </div>
      </Link>
      <Link
        href={CANDIDATE_JOBS_PATH}
        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Briefcase className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Job Board</p>
          <p className="text-xs text-gray-500">Discover open roles</p>
        </div>
      </Link>
    </div>
  );
}
