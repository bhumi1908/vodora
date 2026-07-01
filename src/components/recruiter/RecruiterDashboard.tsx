"use client";

import { useMemo, useState } from "react";

import { RecruiterCandidateCard } from "@/components/recruiter/RecruiterCandidateCard";
import { RecruiterCandidatesEmptyState } from "@/components/recruiter/RecruiterCandidatesEmptyState";
import { RecruiterCreateJobModal } from "@/components/recruiter/RecruiterCreateJobModal";
import { RecruiterDashboardHeader } from "@/components/recruiter/RecruiterDashboardHeader";
import {
  RecruiterDashboardCandidatesHeader,
  RecruiterDashboardSidebar,
  RecruiterDashboardStats,
} from "@/components/recruiter/RecruiterDashboardStaticSections";
import { formatRecruiterJobStatsForDisplay } from "@/lib/jobs/format-recruiter-job-stats";
import type { RecruiterDashboardData } from "@/lib/recruiter/dashboard.types";
import { useRecruiterJobsQuery } from "@/lib/query/use-job-queries";

type RecruiterDashboardProps = {
  data: RecruiterDashboardData;
  recruiterUserId: string;
};

const EMPTY_JOB_STATS = {
  totalPlacements: 0,
  activeRoles: 0,
  candidatesWorkedWith: 0,
  avgTimeToHireDays: null,
  hiringFasterPercent: null,
  hoursSavedThisMonth: 0,
};

export function RecruiterDashboard({ data, recruiterUserId }: RecruiterDashboardProps) {
  const { context, candidates, candidatesError, savedCount, candidatesViewedCount } = data;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: jobsData, isPending: isJobsPending } = useRecruiterJobsQuery();

  const jobStats = useMemo(
    () => formatRecruiterJobStatsForDisplay(jobsData?.stats ?? EMPTY_JOB_STATS),
    [jobsData?.stats],
  );

  const activeJobs = useMemo(() => {
    const published = (jobsData?.jobs ?? []).filter((job) => job.status === "published");

    return [...published]
      .sort((left, right) => {
        const leftHasNew = left.newApplicantCount > 0;
        const rightHasNew = right.newApplicantCount > 0;

        if (leftHasNew !== rightHasNew) {
          return leftHasNew ? -1 : 1;
        }

        return 0;
      })
      .slice(0, 3);
  }, [jobsData?.jobs]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <RecruiterDashboardHeader
        context={context}
        onPostJob={() => setCreateModalOpen(true)}
      />

      <RecruiterDashboardStats
        savedCount={savedCount}
        candidatesViewedCount={candidatesViewedCount}
        activeJobPosts={jobStats.activeRoles}
        avgTimeToHire={jobStats.avgTimeToHire}
        isJobsPending={isJobsPending}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <RecruiterDashboardCandidatesHeader />

          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <RecruiterCandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <RecruiterCandidatesEmptyState candidatesError={candidatesError} />
          )}
        </div>

        <RecruiterDashboardSidebar
          context={context}
          activeJobs={activeJobs}
          isJobsPending={isJobsPending}
          hiringFasterPercent={jobStats.hiringFasterPercent}
          hoursSavedThisMonth={jobStats.hoursSavedThisMonth}
          onAddJob={() => setCreateModalOpen(true)}
        />
      </div>

      <RecruiterCreateJobModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultCompanyName={context.companyName ?? ""}
        recruiterUserId={recruiterUserId}
        workTypes={jobsData?.workTypes ?? []}
      />
    </div>
  );
}
