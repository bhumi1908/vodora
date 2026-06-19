-- Allow candidates to read recruiter profiles and names for published job postings.

CREATE POLICY recruiters_select_published_job_postings ON public.recruiters
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.job_postings jp
      WHERE jp.recruiter_id = recruiters.id
        AND jp.status = 'published'
    )
  );

CREATE POLICY users_select_published_job_recruiters ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      INNER JOIN public.job_postings jp ON jp.recruiter_id = r.id
      WHERE r.user_id = users.id
        AND jp.status = 'published'
    )
  );
