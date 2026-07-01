-- Track whether a recruiter has viewed a job application yet.

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.job_applications.is_new IS
  'True until the recruiter opens the application details; defaults to true on apply.';

-- Existing applications were already available to recruiters.
UPDATE public.job_applications
SET is_new = FALSE
WHERE is_new = TRUE;

CREATE INDEX IF NOT EXISTS job_applications_job_posting_is_new_idx
  ON public.job_applications (job_posting_id)
  WHERE is_new = TRUE;
