-- Job application apply flow: default cover letter on profile + realtime notifications.

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS default_cover_letter TEXT;

COMMENT ON COLUMN public.candidates.default_cover_letter IS
  'Last cover letter text used when applying; pre-fills future applications.';

ALTER TABLE public.job_applications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
