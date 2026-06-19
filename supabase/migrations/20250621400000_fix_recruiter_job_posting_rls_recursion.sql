-- Fix infinite RLS recursion between recruiters and job_postings.
-- recruiters_select_published_job_postings queries job_postings, whose policies
-- query recruiters again — causing 500 errors on every recruiters SELECT.

CREATE OR REPLACE FUNCTION public.is_own_recruiter(p_recruiter_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.id = p_recruiter_id
      AND r.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.recruiter_has_published_job(p_recruiter_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.job_postings jp
    WHERE jp.recruiter_id = p_recruiter_id
      AND jp.status = 'published'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_published_job_posting(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.recruiters r
    INNER JOIN public.job_postings jp ON jp.recruiter_id = r.id
    WHERE r.user_id = p_user_id
      AND jp.status = 'published'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_own_job_posting(p_job_posting_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.job_postings jp
    INNER JOIN public.recruiters r ON r.id = jp.recruiter_id
    WHERE jp.id = p_job_posting_id
      AND r.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_own_recruiter(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recruiter_has_published_job(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_published_job_posting(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_own_job_posting(UUID) TO authenticated;

DROP POLICY IF EXISTS recruiters_select_published_job_postings ON public.recruiters;

CREATE POLICY recruiters_select_published_job_postings ON public.recruiters
  FOR SELECT TO authenticated
  USING (public.recruiter_has_published_job(id));

DROP POLICY IF EXISTS users_select_published_job_recruiters ON public.users;

CREATE POLICY users_select_published_job_recruiters ON public.users
  FOR SELECT TO authenticated
  USING (public.user_has_published_job_posting(id));

DROP POLICY IF EXISTS job_postings_select ON public.job_postings;

CREATE POLICY job_postings_select ON public.job_postings
  FOR SELECT TO authenticated
  USING (
    status = 'published'
    OR public.is_own_recruiter(recruiter_id)
  );

DROP POLICY IF EXISTS job_postings_insert_own ON public.job_postings;

CREATE POLICY job_postings_insert_own ON public.job_postings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_own_recruiter(recruiter_id));

DROP POLICY IF EXISTS job_postings_update_own ON public.job_postings;

CREATE POLICY job_postings_update_own ON public.job_postings
  FOR UPDATE TO authenticated
  USING (public.is_own_recruiter(recruiter_id))
  WITH CHECK (public.is_own_recruiter(recruiter_id));

DROP POLICY IF EXISTS job_postings_delete_own ON public.job_postings;

CREATE POLICY job_postings_delete_own ON public.job_postings
  FOR DELETE TO authenticated
  USING (public.is_own_recruiter(recruiter_id));

DROP POLICY IF EXISTS job_applications_select_recruiter ON public.job_applications;

CREATE POLICY job_applications_select_recruiter ON public.job_applications
  FOR SELECT TO authenticated
  USING (public.is_own_job_posting(job_posting_id));

DROP POLICY IF EXISTS job_applications_update_recruiter ON public.job_applications;

CREATE POLICY job_applications_update_recruiter ON public.job_applications
  FOR UPDATE TO authenticated
  USING (public.is_own_job_posting(job_posting_id))
  WITH CHECK (public.is_own_job_posting(job_posting_id));
