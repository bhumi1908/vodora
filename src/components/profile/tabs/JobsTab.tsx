"use client";

import {
  AppliedJobCard,
  AppliedJobsEmptyState,
} from "@/components/jobs/AppliedJobCard";
import { getCandidateJobPath } from "@/lib/auth/routes";
import { useAppliedJobsQuery } from "@/lib/query/use-job-queries";

function JobsTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-gray-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export function JobsTab() {
  const { data: applications = [], isLoading, isError } = useAppliedJobsQuery();

  if (isLoading) {
    return <JobsTabSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load your job applications. Please try again.
      </p>
    );
  }

  if (applications.length === 0) {
    return <AppliedJobsEmptyState />;
  }

  return (
    <div className="min-w-0 space-y-4">
      <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
        Job Applications
      </h2>
      {applications.map((application) => (
        <AppliedJobCard
          key={application.applicationId}
          job={application.job}
          status={application.status}
          appliedLabel={application.appliedAt}
          referencesShared={application.referencesAttached ? 2 : 0}
          viewJobHref={getCandidateJobPath(application.job.id)}
        />
      ))}
    </div>
  );
}
