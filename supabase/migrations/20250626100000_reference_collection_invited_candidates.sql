-- Recruiter-initiated reference collection: track invited candidate stubs.

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS invited_by_recruiter_id UUID REFERENCES public.recruiters (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS candidates_invited_by_recruiter_id_idx
  ON public.candidates (invited_by_recruiter_id)
  WHERE invited_by_recruiter_id IS NOT NULL;

COMMENT ON COLUMN public.candidates.invited_by_recruiter_id IS
  'Set when a recruiter creates a stub candidate account for external reference collection. Cleared after the candidate completes account setup.';
