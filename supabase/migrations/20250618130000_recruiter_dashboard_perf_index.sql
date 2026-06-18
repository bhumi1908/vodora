-- Speed up recruiter dashboard candidate listing (ORDER BY updated_at DESC).
CREATE INDEX IF NOT EXISTS candidates_recruiter_listing_idx
  ON public.candidates (updated_at DESC)
  WHERE visibility IN ('recruiters_only', 'public');
