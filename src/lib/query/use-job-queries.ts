import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchAppliedJobIds,
  fetchAppliedJobs,
  fetchJobApplyContext,
  fetchRecruiterApplicationTotal,
  fetchRecruiterJobApplicantDetail,
  fetchRecruiterJobApplicants,
  markRecruiterJobApplicantAsRead,
  submitJobApplication,
  updateRecruiterJobApplicantStatus,
} from "@/lib/query/job-application-fetchers";
import {
  createRecruiterJobPosting,
  fetchPublishedJobById,
  fetchPublishedJobs,
  fetchRecruiterJobById,
  fetchRecruiterJobs,
  updateRecruiterJobPosting,
} from "@/lib/query/job-fetchers";
import { jobKeys, type PublishedJobsQueryParams } from "@/lib/query/keys";
import type {
  CreateJobPostingPayload,
  UpdateJobPostingPayload,
} from "@/lib/jobs/recruiter-jobs.types";
import type { SubmitJobApplicationPayload } from "@/lib/jobs/job-application.types";
import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import type {
  RecruiterJobApplicantDetail,
  RecruiterJobApplicantsResponse,
} from "@/lib/jobs/recruiter-job-applications.types";

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

export function useRecruiterJobDetailQuery(jobId: string | null, enabled = true) {
  return useQuery({
    queryKey: jobKeys.recruiterDetail(jobId ?? ""),
    queryFn: () => fetchRecruiterJobById(jobId!),
    enabled: enabled && Boolean(jobId),
    staleTime: STALE_TIME_MS,
  });
}

export function useUpdateRecruiterJobMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateJobPostingPayload) =>
      updateRecruiterJobPosting(jobId, payload),
    onSuccess: (result) => {
      if (result.success) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.recruiter() });
        void queryClient.invalidateQueries({
          queryKey: jobKeys.recruiterDetail(jobId),
        });
        void queryClient.invalidateQueries({
          queryKey: jobKeys.recruiterJobApplicants(jobId),
        });
        void queryClient.invalidateQueries({ queryKey: jobKeys.all });
      }
    },
  });
}

export function useAppliedJobIdsQuery(enabled = true) {
  return useQuery({
    queryKey: jobKeys.appliedIds(),
    queryFn: fetchAppliedJobIds,
    staleTime: STALE_TIME_MS,
    enabled,
  });
}

export function useAppliedJobsQuery(enabled = true) {
  return useQuery({
    queryKey: jobKeys.applied(),
    queryFn: fetchAppliedJobs,
    staleTime: STALE_TIME_MS,
    enabled,
  });
}

export function useJobApplyContextQuery(jobId: string | null, enabled = true) {
  return useQuery({
    queryKey: jobKeys.applyContext(jobId ?? ""),
    queryFn: () => fetchJobApplyContext(jobId!),
    enabled: Boolean(jobId) && enabled,
    staleTime: 0,
  });
}

export function useSubmitJobApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      payload,
    }: {
      jobId: string;
      payload: SubmitJobApplicationPayload;
    }) => submitJobApplication(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.appliedIds() });
      void queryClient.invalidateQueries({ queryKey: jobKeys.applied() });
      void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useRecruiterApplicationTotalQuery(enabled = true) {
  return useQuery({
    queryKey: jobKeys.recruiterApplicationTotal(),
    queryFn: fetchRecruiterApplicationTotal,
    staleTime: STALE_TIME_MS,
    enabled,
  });
}

export function useRecruiterJobApplicantsQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: jobKeys.recruiterJobApplicants(jobId),
    queryFn: () => fetchRecruiterJobApplicants(jobId),
    staleTime: STALE_TIME_MS,
    enabled: enabled && Boolean(jobId),
  });
}

export function useRecruiterJobApplicantDetailQuery(
  jobId: string,
  applicationId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: jobKeys.recruiterJobApplicant(jobId, applicationId ?? ""),
    queryFn: () => fetchRecruiterJobApplicantDetail(jobId, applicationId!),
    staleTime: STALE_TIME_MS,
    enabled: enabled && Boolean(jobId) && Boolean(applicationId),
  });
}

export function useUpdateRecruiterJobApplicantStatusMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: JobApplicationStatus;
    }) => updateRecruiterJobApplicantStatus(jobId, applicationId, status),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: jobKeys.recruiterJobApplicants(jobId),
      });
      void queryClient.invalidateQueries({
        queryKey: jobKeys.recruiterJobApplicant(jobId, variables.applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: jobKeys.recruiter() });
    },
  });
}

export function useMarkRecruiterJobApplicantAsReadMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId }: { applicationId: string }) =>
      markRecruiterJobApplicantAsRead(jobId, applicationId),
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<RecruiterJobApplicantsResponse>(
        jobKeys.recruiterJobApplicants(jobId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            applicants: current.applicants.map((applicant) =>
              applicant.applicationId === variables.applicationId
                ? { ...applicant, isNew: false }
                : applicant,
            ),
          };
        },
      );

      queryClient.setQueryData<RecruiterJobApplicantDetail>(
        jobKeys.recruiterJobApplicant(jobId, variables.applicationId),
        (current) => (current ? { ...current, isNew: false } : current),
      );
    },
  });
}
