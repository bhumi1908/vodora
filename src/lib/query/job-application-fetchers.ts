import type {
  CandidateAppliedJob,
  JobApplyContext,
  SubmitJobApplicationPayload,
} from "@/lib/jobs/job-application.types";
import type {
  RecruiterJobApplicantDetail,
  RecruiterJobApplicantsResponse,
} from "@/lib/jobs/recruiter-job-applications.types";
import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

type AppliedJobsResponse = {
  success: boolean;
  error?: string;
  jobIds?: string[];
  applications?: CandidateAppliedJob[];
};

export async function fetchAppliedJobs(): Promise<CandidateAppliedJob[]> {
  const response = await fetch("/api/jobs/applied");
  const payload = await parseJson<AppliedJobsResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load your applications.");
  }

  return payload.applications ?? [];
}

export async function fetchAppliedJobIds(): Promise<string[]> {
  const response = await fetch("/api/jobs/applied");
  const payload = await parseJson<AppliedJobsResponse>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load your applications.");
  }

  if (payload.jobIds) {
    return payload.jobIds;
  }

  return (payload.applications ?? []).map((application) => application.job.id);
}

export async function fetchJobApplyContext(jobId: string): Promise<JobApplyContext> {
  const response = await fetch(`/api/jobs/${jobId}/apply`);
  const payload = await parseJson<{
    success: boolean;
    error?: string;
    context?: JobApplyContext;
  }>(response);

  if (!response.ok || !payload.success || !payload.context) {
    throw new Error(payload.error ?? "Could not load application details.");
  }

  return payload.context;
}

export async function submitJobApplication(
  jobId: string,
  payload: SubmitJobApplicationPayload,
): Promise<{ applicationId: string; alreadyApplied: boolean }> {
  const response = await fetch(`/api/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<{
    success: boolean;
    error?: string;
    applicationId?: string;
    alreadyApplied?: boolean;
  }>(response);

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Could not submit your application.");
  }

  return {
    applicationId: data.applicationId ?? "",
    alreadyApplied: Boolean(data.alreadyApplied),
  };
}

export async function fetchRecruiterApplicationTotal(): Promise<number> {
  const response = await fetch("/api/recruiter/jobs/application-total");
  const payload = await parseJson<{ success: boolean; error?: string; total?: number }>(
    response,
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load application alerts.");
  }

  return payload.total ?? 0;
}

export async function fetchRecruiterJobApplicants(
  jobId: string,
): Promise<RecruiterJobApplicantsResponse> {
  const response = await fetch(`/api/recruiter/jobs/${encodeURIComponent(jobId)}/applications`);
  const payload = await parseJson<{
    success: boolean;
    error?: string;
    job?: RecruiterJobApplicantsResponse["job"];
    applicants?: RecruiterJobApplicantsResponse["applicants"];
  }>(response);

  if (response.status === 404) {
    throw new Error(payload.error ?? "Job not found.");
  }

  if (!response.ok || !payload.success || !payload.job) {
    throw new Error(payload.error ?? "Could not load applicants.");
  }

  return {
    job: payload.job,
    applicants: payload.applicants ?? [],
  };
}

export async function fetchRecruiterJobApplicantDetail(
  jobId: string,
  applicationId: string,
): Promise<RecruiterJobApplicantDetail> {
  const response = await fetch(
    `/api/recruiter/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}`,
  );
  const payload = await parseJson<{
    success: boolean;
    error?: string;
    applicant?: RecruiterJobApplicantDetail;
  }>(response);

  if (response.status === 404) {
    throw new Error(payload.error ?? "Application not found.");
  }

  if (!response.ok || !payload.success || !payload.applicant) {
    throw new Error(payload.error ?? "Could not load application details.");
  }

  return payload.applicant;
}

export async function updateRecruiterJobApplicantStatus(
  jobId: string,
  applicationId: string,
  status: JobApplicationStatus,
): Promise<JobApplicationStatus> {
  const response = await fetch(
    `/api/recruiter/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );

  const payload = await parseJson<{
    success: boolean;
    error?: string;
    status?: JobApplicationStatus;
  }>(response);

  if (!response.ok || !payload.success || !payload.status) {
    throw new Error(payload.error ?? "Could not update application status.");
  }

  return payload.status;
}
