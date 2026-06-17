import { RecruiterCandidateCard } from "@/components/recruiter/RecruiterCandidateCard";
import { RecruiterCandidatesEmptyState } from "@/components/recruiter/RecruiterCandidatesEmptyState";
import { RecruiterDashboardHeader } from "@/components/recruiter/RecruiterDashboardHeader";
import {
  RecruiterDashboardCandidatesHeader,
  RecruiterDashboardSidebar,
  RecruiterDashboardStats,
} from "@/components/recruiter/RecruiterDashboardStaticSections";
import { StaticWorkInProgressNotice } from "@/components/profile/StaticWorkInProgressNotice";
import type { RecruiterDashboardData } from "@/lib/recruiter/dashboard.types";

type RecruiterDashboardProps = {
  data: RecruiterDashboardData;
};

export function RecruiterDashboard({ data }: RecruiterDashboardProps) {
  const { context, candidates, candidatesError } = data;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <RecruiterDashboardHeader context={context} />

      <StaticWorkInProgressNotice section="stats, job posts, recruiter profile, and hiring insights" />

      <RecruiterDashboardStats />

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

        <RecruiterDashboardSidebar context={context} />
      </div>
    </div>
  );
}
