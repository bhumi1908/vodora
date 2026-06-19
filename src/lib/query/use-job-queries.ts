import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createRecruiterJobPosting,
  fetchPublishedJobById,
  fetchPublishedJobs,
  fetchRecruiterJobs,
} from "@/lib/query/job-fetchers";
import { jobKeys, type PublishedJobsQueryParams } from "@/lib/query/keys";
import type { CreateJobPostingPayload } from "@/lib/jobs/recruiter-jobs.types";

const STALE_TIME_MS = 60_000;

export function usePublishedJobsQuery(params: PublishedJobsQueryParams) {
  return useQuery({
    queryKey: jobKeys.published(params),
    queryFn: () => fetchPublishedJobs(params),
    staleTime: STALE_TIME_MS,
    placeholderData: (previous) => previous,
  });
}

export function usePublishedJobDetailQuery(jobId: string | null) {
  return useQuery({
    queryKey: jobKeys.detail(jobId ?? ""),
    queryFn: () => fetchPublishedJobById(jobId!),
    enabled: Boolean(jobId),
    staleTime: STALE_TIME_MS,
  });
}

export function useRecruiterJobsQuery(enabled = true) {
  return useQuery({
    queryKey: jobKeys.recruiter(),
    queryFn: fetchRecruiterJobs,
    staleTime: STALE_TIME_MS,
    enabled,
  });
}

export function useCreateRecruiterJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPostingPayload) =>
      createRecruiterJobPosting(payload),
    onSuccess: (result) => {
      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.recruiter() });
        void queryClient.invalidateQueries({ queryKey: jobKeys.all });
      }
    },
  });
}
