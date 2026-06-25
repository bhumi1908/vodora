-- API performance: supporting indexes and batch RPCs to reduce round trips.

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS job_applications_job_posting_applied_at_idx
  ON public.job_applications (job_posting_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS job_postings_recruiter_id_id_idx
  ON public.job_postings (recruiter_id, id);

CREATE INDEX IF NOT EXISTS industry_categories_active_sort_idx
  ON public.industry_categories (sort_order, name)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS work_types_active_sort_idx
  ON public.work_types (sort_order, name)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS job_titles_active_sort_idx
  ON public.job_titles (sort_order, name)
  WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- Batch RPC — reference collection candidate details
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_reference_collection_candidate_details_batch(
  p_candidate_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.user_id = auth.uid()
  ) THEN
    RETURN '[]'::jsonb;
  END IF;

  IF p_candidate_ids IS NULL OR cardinality(p_candidate_ids) = 0 THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'candidate_id', c.id,
          'vodora_id', c.vodora_id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'title', COALESCE(
            NULLIF(btrim(c.current_position), ''),
            NULLIF(btrim(c.headline), ''),
            NULLIF(btrim(c.profession), '')
          ),
          'company', NULLIF(btrim(c.current_company_name), '')
        )
        ORDER BY c.id
      )
      FROM public.candidates c
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE c.id = ANY(p_candidate_ids)
        AND c.visibility IN ('recruiters_only', 'public')
        AND u.is_active = TRUE
        AND u.email_verified_at IS NOT NULL
    ),
    '[]'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_reference_collection_candidate_details_batch(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reference_collection_candidate_details_batch(UUID[]) TO authenticated;

-- ---------------------------------------------------------------------------
-- Batch RPC — verified reference counts
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.count_verified_references_batch(
  p_candidate_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_candidate_ids IS NULL OR cardinality(p_candidate_ids) = 0 THEN
    RETURN '{}'::jsonb;
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_object_agg(sub.candidate_id::text, sub.cnt)
      FROM (
        SELECT
          rr.candidate_id,
          COUNT(*)::INTEGER AS cnt
        FROM public.reference_requests rr
        WHERE rr.candidate_id = ANY(p_candidate_ids)
          AND rr.status = 'verified'
        GROUP BY rr.candidate_id
      ) sub
    ),
    '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.count_verified_references_batch(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_verified_references_batch(UUID[]) TO authenticated;

-- ---------------------------------------------------------------------------
-- Batch RPC — recruiter candidate profiles (single round trip)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_recruiter_candidate_profiles_batch(
  p_vodora_ids TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vodora_id TEXT;
  v_profile JSONB;
  v_profiles JSONB := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.user_id = auth.uid()
  ) THEN
    RETURN '[]'::jsonb;
  END IF;

  IF p_vodora_ids IS NULL OR cardinality(p_vodora_ids) = 0 THEN
    RETURN '[]'::jsonb;
  END IF;

  FOREACH v_vodora_id IN ARRAY p_vodora_ids
  LOOP
    v_profile := public.get_recruiter_candidate_profile(v_vodora_id);

    IF v_profile IS NOT NULL THEN
      v_profiles := v_profiles || jsonb_build_array(v_profile);
    END IF;
  END LOOP;

  RETURN v_profiles;
END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_candidate_profiles_batch(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_candidate_profiles_batch(TEXT[]) TO authenticated;
