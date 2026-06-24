-- Phase A: job-apply reference sharing via recruiter grants.

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS included_reference_ids UUID[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.job_applications.included_reference_ids IS
  'Verified reference request IDs shared with the job recruiter; empty array means full passport when references_attached is true.';

-- ---------------------------------------------------------------------------
-- Table — reference_recruiter_grants
-- ---------------------------------------------------------------------------

CREATE TABLE public.reference_recruiter_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.recruiters (id) ON DELETE CASCADE,
  grant_source VARCHAR(30) NOT NULL DEFAULT 'job_application',
  job_application_id UUID REFERENCES public.job_applications (id) ON DELETE CASCADE,
  share_type VARCHAR(30) NOT NULL,
  included_reference_ids UUID[] NOT NULL DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{
    "show_verification_status": true,
    "show_ratings": true,
    "show_employment_confirmation": true,
    "show_written_comments": true,
    "show_referee_contact": false
  }'::JSONB,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reference_recruiter_grants_grant_source_check CHECK (
    grant_source IN ('job_application', 'manual', 'connection')
  ),
  CONSTRAINT reference_recruiter_grants_share_type_check CHECK (
    share_type IN ('full_passport', 'selected_references')
  )
);

CREATE TRIGGER reference_recruiter_grants_set_updated_at
  BEFORE UPDATE ON public.reference_recruiter_grants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX reference_recruiter_grants_candidate_id_idx
  ON public.reference_recruiter_grants (candidate_id);

CREATE INDEX reference_recruiter_grants_recruiter_id_idx
  ON public.reference_recruiter_grants (recruiter_id);

CREATE INDEX reference_recruiter_grants_active_idx
  ON public.reference_recruiter_grants (candidate_id, recruiter_id)
  WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX reference_recruiter_grants_job_application_idx
  ON public.reference_recruiter_grants (job_application_id)
  WHERE job_application_id IS NOT NULL;

ALTER TABLE public.reference_recruiter_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY reference_recruiter_grants_select_candidate ON public.reference_recruiter_grants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_recruiter_grants.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_recruiter_grants_insert_candidate ON public.reference_recruiter_grants
  FOR INSERT TO authenticated
  WITH CHECK (
    grant_source = 'job_application'
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_recruiter_grants.candidate_id
        AND c.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.job_applications ja
      INNER JOIN public.job_postings jp ON jp.id = ja.job_posting_id
      WHERE ja.id = reference_recruiter_grants.job_application_id
        AND ja.candidate_id = reference_recruiter_grants.candidate_id
        AND jp.recruiter_id = reference_recruiter_grants.recruiter_id
        AND ja.references_attached = TRUE
    )
  );

CREATE POLICY reference_recruiter_grants_select_recruiter ON public.reference_recruiter_grants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = reference_recruiter_grants.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY reference_recruiter_grants_admin_all ON public.reference_recruiter_grants
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

GRANT SELECT, INSERT ON public.reference_recruiter_grants TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC — recruiter_has_reference_grant
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.recruiter_has_reference_grant(p_candidate_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reference_recruiter_grants g
    INNER JOIN public.recruiters r ON r.id = g.recruiter_id
    WHERE g.candidate_id = p_candidate_id
      AND r.user_id = auth.uid()
      AND g.revoked_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.recruiter_has_reference_grant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recruiter_has_reference_grant(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC — get_recruiter_candidate_references
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_recruiter_candidate_references(p_candidate_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_show_all BOOLEAN;
  v_allowed_ids UUID[];
  v_permissions JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.user_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  IF NOT public.recruiter_has_reference_grant(p_candidate_id) THEN
    RETURN '[]'::JSONB;
  END IF;

  SELECT
    COALESCE(
      BOOL_OR(
        g.share_type = 'full_passport'
        OR (
          g.share_type = 'selected_references'
          AND cardinality(g.included_reference_ids) = 0
        )
      ),
      FALSE
    ),
    COALESCE(
      ARRAY(
        SELECT DISTINCT unnest(g.included_reference_ids)
        FROM public.reference_recruiter_grants g
        INNER JOIN public.recruiters r ON r.id = g.recruiter_id
        WHERE g.candidate_id = p_candidate_id
          AND r.user_id = auth.uid()
          AND g.revoked_at IS NULL
          AND g.share_type = 'selected_references'
          AND cardinality(g.included_reference_ids) > 0
      ),
      '{}'::UUID[]
    ),
    (
      SELECT g.permissions
      FROM public.reference_recruiter_grants g
      INNER JOIN public.recruiters r ON r.id = g.recruiter_id
      WHERE g.candidate_id = p_candidate_id
        AND r.user_id = auth.uid()
        AND g.revoked_at IS NULL
      ORDER BY g.created_at DESC
      LIMIT 1
    )
  INTO v_show_all, v_allowed_ids, v_permissions
  FROM public.reference_recruiter_grants g
  INNER JOIN public.recruiters r ON r.id = g.recruiter_id
  WHERE g.candidate_id = p_candidate_id
    AND r.user_id = auth.uid()
    AND g.revoked_at IS NULL;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', rr.id,
          'referee_name', rr.referee_name,
          'referee_title', rr.referee_title,
          'referee_company', rr.referee_company,
          'referee_email', CASE
            WHEN COALESCE((v_permissions->>'show_referee_contact')::BOOLEAN, FALSE)
              THEN rr.referee_email
            ELSE NULL
          END,
          'referee_phone', CASE
            WHEN COALESCE((v_permissions->>'show_referee_contact')::BOOLEAN, FALSE)
              THEN rr.referee_phone
            ELSE NULL
          END,
          'relationship', rr.relationship,
          'employment_start', rr.employment_start,
          'employment_end', rr.employment_end,
          'reference_type', rr.reference_type,
          'status', rr.status,
          'created_at', rr.created_at,
          'submitted_at', rr.submitted_at,
          'verified_at', rr.verified_at,
          'written_comments', CASE
            WHEN COALESCE((v_permissions->>'show_written_comments')::BOOLEAN, TRUE)
              THEN resp.written_comments
            ELSE NULL
          END,
          'questionnaire_responses', CASE
            WHEN COALESCE((v_permissions->>'show_written_comments')::BOOLEAN, TRUE)
              THEN resp.questionnaire_responses
            ELSE NULL
          END,
          'performance_rating', CASE
            WHEN COALESCE((v_permissions->>'show_ratings')::BOOLEAN, TRUE)
              THEN resp.performance_rating
            ELSE NULL
          END,
          'reliability_rating', CASE
            WHEN COALESCE((v_permissions->>'show_ratings')::BOOLEAN, TRUE)
              THEN resp.reliability_rating
            ELSE NULL
          END,
          'teamwork_rating', CASE
            WHEN COALESCE((v_permissions->>'show_ratings')::BOOLEAN, TRUE)
              THEN resp.teamwork_rating
            ELSE NULL
          END,
          'leadership_rating', CASE
            WHEN COALESCE((v_permissions->>'show_ratings')::BOOLEAN, TRUE)
              THEN resp.leadership_rating
            ELSE NULL
          END,
          'rehire_recommendation', CASE
            WHEN COALESCE((v_permissions->>'show_ratings')::BOOLEAN, TRUE)
              THEN resp.rehire_recommendation
            ELSE NULL
          END,
          'employment_confirmed', CASE
            WHEN COALESCE((v_permissions->>'show_employment_confirmation')::BOOLEAN, TRUE)
              THEN resp.employment_confirmed
            ELSE NULL
          END,
          'employment_dates_confirmed', CASE
            WHEN COALESCE((v_permissions->>'show_employment_confirmation')::BOOLEAN, TRUE)
              THEN resp.employment_dates_confirmed
            ELSE NULL
          END
        )
        ORDER BY rr.verified_at DESC NULLS LAST, rr.created_at DESC
      )
      FROM public.reference_requests rr
      LEFT JOIN public.reference_responses resp
        ON resp.reference_request_id = rr.id
      WHERE rr.candidate_id = p_candidate_id
        AND rr.status = 'verified'
        AND (
          v_show_all
          OR rr.id = ANY (v_allowed_ids)
        )
    ),
    '[]'::JSONB
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_candidate_references(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_candidate_references(UUID) TO authenticated;
