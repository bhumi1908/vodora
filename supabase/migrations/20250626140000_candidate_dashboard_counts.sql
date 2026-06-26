-- Dashboard stats for candidates (profile views, application count bundle).

CREATE OR REPLACE FUNCTION public.get_candidate_recruiter_profile_views_count()
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
      INNER JOIN public.candidates c ON c.id = rcpv.candidate_id
      WHERE c.user_id = auth.uid()
    ),
    0
  );
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_dashboard_counts()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'profile_views_count', public.get_candidate_recruiter_profile_views_count(),
    'applications_count', COALESCE(
      (
        SELECT COUNT(*)::INT
        FROM public.job_applications ja
        INNER JOIN public.candidates c ON c.id = ja.candidate_id
        WHERE c.user_id = auth.uid()
      ),
      0
    )
  );
$$;

REVOKE ALL ON FUNCTION public.get_candidate_recruiter_profile_views_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_recruiter_profile_views_count() TO authenticated;

REVOKE ALL ON FUNCTION public.get_candidate_dashboard_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_dashboard_counts() TO authenticated;
