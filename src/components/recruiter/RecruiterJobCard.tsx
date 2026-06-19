import { Briefcase, MapPin } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import type { RecruiterJobListItem } from "@/lib/jobs/recruiter-jobs.types";

type RecruiterJobCardProps = {
  role: RecruiterJobListItem;
};

export function RecruiterJobCard({ role }: RecruiterJobCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
              {role.title}
            </h3>
            {role.urgent ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                Urgent
              </span>
            ) : null}
            {role.status === "draft" ? (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                Draft
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              {role.type}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {role.location}
            </span>
            <span className="font-medium text-gray-700">{role.salary}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
          <div>
            <p className="text-2xl font-bold text-gray-900">{role.applicants}</p>
            <p className="text-xs text-gray-500">applicants</p>
          </div>
          <p className="text-xs text-gray-400 sm:mt-1">Posted {role.posted}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <button
          type="button"
          disabled
          className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 opacity-60 sm:w-auto"
        >
          View Applicants
        </button>
        <button
          type="button"
          disabled
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 opacity-60 sm:w-auto"
        >
          Edit Role
        </button>
      </div>
    </div>
  );
}

export function RecruiterJobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-6 w-2/3 max-w-xs" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="space-y-2 sm:text-right">
          <Skeleton className="h-8 w-12 sm:ml-auto" />
          <Skeleton className="h-3 w-20 sm:ml-auto" />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}
