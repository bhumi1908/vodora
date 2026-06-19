import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";

export {
  CANDIDATE_JOBS_PAGE_SIZE,
  JOB_CATEGORIES,
  JOB_LOCATIONS,
  JOB_POSTING_CATEGORIES,
  JOB_WORK_TYPES,
} from "@/lib/jobs/job-board-options";

export const JOB_APPLICATION_STATUS_STYLES: Record<JobApplicationStatus, string> =
  {
    Applied: "bg-blue-50 text-blue-700 border-blue-200",
    Shortlisted: "bg-amber-50 text-amber-700 border-amber-200",
    Interview: "bg-purple-50 text-purple-700 border-purple-200",
    Offer: "bg-green-50 text-green-700 border-green-200",
    Unsuccessful: "bg-gray-50 text-gray-600 border-gray-200",
  };
