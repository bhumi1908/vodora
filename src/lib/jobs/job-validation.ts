import { JOB_POSTING_CATEGORIES } from "@/lib/jobs/job-board-options";
import type {
  CreateJobPostingFieldErrors,
  CreateJobPostingPayload,
} from "@/lib/jobs/recruiter-jobs.types";

export function getCreateJobPostingFieldErrors(
  payload: CreateJobPostingPayload,
): CreateJobPostingFieldErrors {
  const errors: CreateJobPostingFieldErrors = {};
  const title = payload.title.trim();

  if (title.length < 2) {
    errors.title = "Job title must be at least 2 characters.";
  }

  if (!payload.companyDisplayName.trim()) {
    errors.companyDisplayName = "Company name is required.";
  }

  if (!(JOB_POSTING_CATEGORIES as readonly string[]).includes(payload.category)) {
    errors.category = "Select a valid category.";
  }

  if (!payload.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!payload.workTypeId.trim()) {
    errors.workTypeId = "Select a work type.";
  }

  if (!payload.description.trim()) {
    errors.description = "Job description is required.";
  }

  return errors;
}

export function hasCreateJobPostingErrors(
  errors: CreateJobPostingFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}
