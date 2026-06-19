import { Plus, Search } from "lucide-react";
import Link from "next/link";

import type { RecruiterDashboardContext } from "@/lib/recruiter/dashboard.types";
import { getRecruiterGreeting } from "@/lib/recruiter/format-candidate-availability";
import { RECRUITER_SEARCH_PATH } from "@/lib/auth/routes";

type RecruiterDashboardHeaderProps = {
  context: RecruiterDashboardContext;
  onPostJob: () => void;
};

export function RecruiterDashboardHeader({
  context,
  onPostJob,
}: RecruiterDashboardHeaderProps) {
  const greeting = getRecruiterGreeting();
  const subtitleParts = [
    context.companyName,
    "Here's what's happening today",
  ].filter(Boolean);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          {greeting}, {context.firstName}
        </h1>
        <p className="mt-1 text-gray-500">{subtitleParts.join(" · ")}</p>
      </div>
      <div className="flex gap-3">
        <Link
          href={RECRUITER_SEARCH_PATH}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Search className="h-4 w-4" />
          Find Candidates
        </Link>
        <button
          type="button"
          onClick={onPostJob}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </button>
      </div>
    </div>
  );
}
