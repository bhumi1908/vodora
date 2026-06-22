import type { CandidateJob, JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";

export type CandidateAppliedJob = {
  applicationId: string;
  job: CandidateJob;
  status: JobApplicationStatus;
  appliedAt: string;
  referencesAttached: boolean;
};

export type JobApplyResume = {
  id: string;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  uploadedAt: string;
};

export type JobApplyCoverLetterDocument = {
  id: string;
  fileName: string;
  uploadedAt: string;
};

export type JobApplyContext = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  resume: JobApplyResume | null;
  coverLetter: string;
  coverLetterDocument: JobApplyCoverLetterDocument | null;
  alreadyApplied: boolean;
};

export type SubmitJobApplicationPayload = {
  coverLetter: string;
  coverLetterDocumentId?: string | null;
  referencesAttached?: boolean;
};

export type SubmitJobApplicationResult = {
  applicationId: string;
  alreadyApplied: boolean;
  error: string | null;
};
