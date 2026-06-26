"use client";

import {
  AppliedJobCard,
  AppliedJobsEmptyState,
} from "@/components/jobs/AppliedJobCard";
import {
  CandidateDashboardApplicationsHeader,
  CandidateDashboardHeader,
  CandidateDashboardQuickLinks,
} from "@/components/candidate/CandidateDashboardHeader";
import {
  CandidateDashboardSidebar,
  CandidateDashboardStats,
} from "@/components/candidate/CandidateDashboardStaticSections";
import { getCandidateJobPath } from "@/lib/auth/routes";
import type { CandidateDashboardData } from "@/lib/candidate/dashboard.types";

type CandidateDashboardProps = {
  data: CandidateDashboardData;
};

export function CandidateDashboard({ data }: CandidateDashboardProps) {
  const {
    context,
    profileCompletionPercent,
    profileCompletionItems,
    connectionCounts,
    applicationsCount,
    profileViewsCount,
    recentApplications,
    applicationsError,
  } = data;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <CandidateDashboardHeader context={context} />

      <CandidateDashboardStats
        profileCompletionPercent={profileCompletionPercent}
        connectionCounts={connectionCounts}
        applicationsCount={applicationsCount}
        profileViewsCount={profileViewsCount}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <CandidateDashboardApplicationsHeader />

          {applicationsError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              Could not load your applications. Please refresh the page.
            </div>
          ) : recentApplications.length > 0 ? (
            recentApplications.map((application) => (
              <AppliedJobCard
                key={application.applicationId}
                job={application.job}
                status={application.status}
                appliedLabel={application.appliedAt}
                viewJobHref={getCandidateJobPath(application.job.id)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white">
              <AppliedJobsEmptyState />
            </div>
          )}

          <div className="pt-2">
            <CandidateDashboardQuickLinks />
          </div>
        </div>

        <CandidateDashboardSidebar
          context={context}
          profileCompletionPercent={profileCompletionPercent}
          profileCompletionItems={profileCompletionItems}
          connectionCounts={connectionCounts}
          profileViewsCount={profileViewsCount}
        />
      </div>
    </div>
  );
}
