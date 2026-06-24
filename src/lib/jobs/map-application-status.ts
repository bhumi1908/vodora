import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";

const STATUS_FROM_DB: Record<string, JobApplicationStatus> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  unsuccessful: "Unsuccessful",
};

const STATUS_TO_DB: Record<JobApplicationStatus, string> = {
  Applied: "applied",
  Shortlisted: "shortlisted",
  Interview: "interview",
  Offer: "offer",
  Unsuccessful: "unsuccessful",
};

export function mapApplicationStatus(dbStatus: string): JobApplicationStatus {
  return STATUS_FROM_DB[dbStatus.toLowerCase()] ?? "Applied";
}

export function toDbApplicationStatus(status: JobApplicationStatus): string {
  return STATUS_TO_DB[status];
}

export const JOB_APPLICATION_STATUS_OPTIONS: JobApplicationStatus[] = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Offer",
  "Unsuccessful",
];
