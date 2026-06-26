import type { ConnectionCounts } from "@/lib/connections/connection.types";
import type { CandidateAppliedJob } from "@/lib/jobs/job-application.types";
import type { ProfileCompletionItem } from "@/lib/profile/profile-completion";

export type CandidateDashboardContext = {
  firstName: string;
  lastName: string;
  title: string | null;
  profilePictureUrl: string | null;
};

export type CandidateDashboardData = {
  context: CandidateDashboardContext;
  profileCompletionPercent: number;
  profileCompletionItems: ProfileCompletionItem[];
  connectionCounts: ConnectionCounts;
  applicationsCount: number;
  profileViewsCount: number;
  recentApplications: CandidateAppliedJob[];
  applicationsError?: string | null;
};
