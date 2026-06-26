-- Track unique candidate profiles viewed by recruiters (dashboard stat).

CREATE TABLE public.recruiter_candidate_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recruiter_candidate_profile_views_recruiter_id_candidate_id_key
    UNIQUE (recruiter_id, candidate_id)
);

CREATE INDEX recruiter_candidate_profile_views_recruiter_id_idx
  ON public.recruiter_candidate_profile_views (recruiter_id);

CREATE INDEX recruiter_candidate_profile_views_candidate_id_idx
  ON public.recruiter_candidate_profile_views (candidate_id);

ALTER TABLE public.recruiter_candidate_profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY recruiter_candidate_profile_views_select_own
  ON public.recruiter_candidate_profile_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = recruiter_candidate_profile_views.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

-- Record a profile view (unique per recruiter/candidate; updates last_viewed_at on repeat).
CREATE OR REPLACE FUNCTION public.record_recruiter_candidate_profile_view(p_candidate_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id UUID;
BEGIN
  IF auth.uid() IS NULL OR p_candidate_id IS NULL THEN
    RETURN;
  END IF;

  SELECT r.id
  INTO v_recruiter_id
  FROM public.recruiters r
  WHERE r.user_id = auth.uid();

  IF v_recruiter_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.candidates c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.id = p_candidate_id
      AND c.visibility IN ('recruiters_only', 'public')
      AND u.is_active = TRUE
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.recruiter_candidate_profile_views (recruiter_id, candidate_id)
  VALUES (v_recruiter_id, p_candidate_id)
  ON CONFLICT (recruiter_id, candidate_id)
  DO UPDATE SET last_viewed_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_recruiter_candidates_viewed_count()
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT COUNT(*)::INT
      FROM public.recruiter_candidate_profile_views rcpv
      INNER JOIN public.recruiters r ON r.id = rcpv.recruiter_id
      INNER JOIN public.candidates c ON c.id = rcpv.candidate_id
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE r.user_id = auth.uid()
        AND c.visibility IN ('recruiters_only', 'public')
        AND u.is_active = TRUE
    ),
    0
  );
$$;

-- Single round-trip for dashboard stat cards.
CREATE OR REPLACE FUNCTION public.get_recruiter_dashboard_counts()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'saved_count', public.get_recruiter_saved_count(),
    'candidates_viewed_count', public.get_recruiter_candidates_viewed_count()
  );
$$;

REVOKE ALL ON FUNCTION public.record_recruiter_candidate_profile_view(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_recruiter_candidate_profile_view(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_recruiter_candidates_viewed_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_candidates_viewed_count() TO authenticated;

REVOKE ALL ON FUNCTION public.get_recruiter_dashboard_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_dashboard_counts() TO authenticated;
