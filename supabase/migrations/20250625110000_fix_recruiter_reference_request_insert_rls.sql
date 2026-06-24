-- Fix recruiter reference request insert RLS: unqualified column names refer to the new row
-- during INSERT WITH CHECK. Qualified reference_requests.* can fail the EXISTS check.

DROP POLICY IF EXISTS reference_requests_insert_recruiter ON public.reference_requests;

CREATE POLICY reference_requests_insert_recruiter ON public.reference_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requested_by_type = 'recruiter'
    AND requested_by_user_id = auth.uid()
    AND requested_by_recruiter_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = requested_by_recruiter_id
        AND r.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE c.id = candidate_id
        AND c.visibility IN ('recruiters_only', 'public')
        AND u.is_active = TRUE
        AND u.email_verified_at IS NOT NULL
    )
  );
