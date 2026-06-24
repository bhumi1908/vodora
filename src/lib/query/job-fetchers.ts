import type { CandidateJob } from "@/lib/jobs/candidate-jobs.types";
import { CANDIDATE_JOBS_PAGE_SIZE } from "@/lib/jobs/job-board-options";
import type {
  CreateJobPostingPayload,
  RecruiterJobDetail,
  RecruiterJobListItem,
  RecruiterJobStats,
  UpdateJobPostingPayload,
  WorkTypeOption,
} from "@/lib/jobs/recruiter-jobs.types";
import type { PublishedJobsQueryParams } from "@/lib/query/keys";

export type PublishedJobsResponse = {
  success: boolean;
  error?: string;
  jobs?: CandidateJob[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  categoryCounts?: Record<string, number>;
};

export type RecruiterJobsResponse = {
  success: boolean;
  error?: string;
  jobs?: RecruiterJobListItem[];
  workTypes?: WorkTypeOption[];
  stats?: RecruiterJobStats;
};

const EMPTY_PUBLISHED_RESULT = {
  jobs: [] as CandidateJob[],
  total: 0,
  page: 1,
  limit: CANDIDATE_JOBS_PAGE_SIZE,
  totalPages: 0,
  categoryCounts: {} as Record<string, number>,
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function buildPublishedJobsUrl(
  params: PublishedJobsQueryParams,
): string {
  const limit = params.limit ?? CANDIDATE_JOBS_PAGE_SIZE;
  const searchParams = new URLSearchParams();

  if (params.category !== "All") {
    searchParams.set("category", params.category);
  }

  if (params.location !== "All Locations") {
    searchParams.set("location", params.location);
  }

  if (params.query.trim()) {
    searchParams.set("q", params.query.trim());
  }

  for (const workType of params.workTypes) {
    searchParams.append("workType", workType);
  }

  if (params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  searchParams.set("limit", String(limit));

  const queryString = searchParams.toString();
  return queryString ? `/api/jobs?${queryString}` : `/api/jobs?limit=${limit}`;
}

export async function fetchPublishedJobs(
  params: PublishedJobsQueryParams,
): Promise<typeof EMPTY_PUBLISHED_RESULT> {
  const response = await fetch(buildPublishedJobsUrl(params));
  const payload = await parseJson<PublishedJobsResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load jobs.");
  }

  return {
    jobs: payload.jobs ?? [],
    total: payload.total ?? 0,
    page: payload.page ?? params.page,
    limit: payload.limit ?? params.limit ?? CANDIDATE_JOBS_PAGE_SIZE,
    totalPages: payload.totalPages ?? 0,
    categoryCounts: payload.categoryCounts ?? {},
  };
}

export async function fetchPublishedJobById(
  jobId: string,
): Promise<CandidateJob | null> {
  const response = await fetch(`/api/jobs/${jobId}`);
  const payload = await parseJson<{ success: boolean; error?: string; job?: CandidateJob }>(
    response,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !payload.success || !payload.job) {
    throw new Error(payload.error ?? "Could not load job.");
  }

  return payload.job;
}

export async function fetchRecruiterJobs(): Promise<{
  jobs: RecruiterJobListItem[];
  workTypes: WorkTypeOption[];
  stats: RecruiterJobStats;
}> {
  const response = await fetch("/api/recruiter/jobs");
  const payload = await parseJson<RecruiterJobsResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load job postings.");
  }

  return {
    jobs: payload.jobs ?? [],
    workTypes: payload.workTypes ?? [],
    stats: payload.stats ?? {
      totalPlacements: 0,
      activeRoles: 0,
      candidatesWorkedWith: 0,
      avgTimeToHireDays: null,
      hiringFasterPercent: null,
      hoursSavedThisMonth: 0,
    },
  };
}

export async function createRecruiterJobPosting(
  payload: CreateJobPostingPayload,
): Promise<{ success: true; jobId: string } | { success: false; error: string }> {
  const response = await fetch("/api/recruiter/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<{
    success: boolean;
    error?: string;
    jobId?: string;
  }>(response);

  if (!response.ok || !data.success || !data.jobId) {
    return {
      success: false,
      error: data.error ?? "Could not create job posting.",
    };
  }

  return {
    success: true,
    jobId: data.jobId,
  };
}

export async function fetchRecruiterJobById(
  jobId: string,
): Promise<RecruiterJobDetail> {
  const response = await fetch(`/api/recruiter/jobs/${jobId}`);
  const payload = await parseJson<{
    success: boolean;
    error?: string;
    job?: RecruiterJobDetail;
  }>(response);

  if (response.status === 404) {
    throw new Error(payload.error ?? "Job not found.");
  }

  if (!response.ok || !payload.success || !payload.job) {
    throw new Error(payload.error ?? "Could not load job posting.");
  }

  return payload.job;
}

export async function updateRecruiterJobPosting(
  jobId: string,
  payload: UpdateJobPostingPayload,
): Promise<{ success: true; jobId: string } | { success: false; error: string }> {
  const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<{
    success: boolean;
    error?: string;
    jobId?: string;
  }>(response);

  if (!response.ok || !data.success || !data.jobId) {
    return {
      success: false,
      error: data.error ?? "Could not update job posting.",
    };
  }

  return {
    success: true,
    jobId: data.jobId,
  };
}

export { EMPTY_PUBLISHED_RESULT };
