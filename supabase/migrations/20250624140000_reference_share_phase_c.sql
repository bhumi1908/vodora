-- Phase C: manual recruiter grants, grant revocation, and share permissions.

-- ---------------------------------------------------------------------------
-- Helper — connected candidate ↔ recruiter
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.candidate_recruiter_are_connected(
  p_candidate_id UUID,
  p_recruiter_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.connections conn
    WHERE conn.status = 'connected'
      AND conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'recruiter'
      AND conn.participant_1_candidate_id = p_candidate_id
      AND conn.participant_2_recruiter_id = p_recruiter_id
  );
$$;

REVOKE ALL ON FUNCTION public.candidate_recruiter_are_connected(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.candidate_recruiter_are_connected(UUID, UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS — manual grants + candidate revoke
-- ---------------------------------------------------------------------------

CREATE POLICY reference_recruiter_grants_insert_manual ON public.reference_recruiter_grants
  FOR INSERT TO authenticated
  WITH CHECK (
    grant_source = 'manual'
    AND job_application_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_recruiter_grants.candidate_id
        AND c.user_id = auth.uid()
    )
    AND public.candidate_recruiter_are_connected(
      reference_recruiter_grants.candidate_id,
      reference_recruiter_grants.recruiter_id
    )
  );

CREATE POLICY reference_recruiter_grants_update_candidate ON public.reference_recruiter_grants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_recruiter_grants.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_recruiter_grants.candidate_id
        AND c.user_id = auth.uid()
    )
  );

GRANT UPDATE ON public.reference_recruiter_grants TO authenticated;

-- Return permissions from share-link RPC for client display controls.
CREATE OR REPLACE FUNCTION public.open_reference_share_link(p_share_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share public.reference_passport_shares%ROWTYPE;
  v_candidate public.candidates%ROWTYPE;
  v_user public.users%ROWTYPE;
  v_permissions JSONB;
  v_show_all BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('error', 'authentication_required');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('error', 'recruiter_required');
  END IF;

  SELECT *
  INTO v_share
  FROM public.reference_passport_shares s
  WHERE s.share_token = p_share_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF NOT v_share.is_active THEN
    RETURN jsonb_build_object('error', 'inactive');
  END IF;

  IF v_share.expires_at IS NOT NULL AND v_share.expires_at <= now() THEN
    RETURN jsonb_build_object('error', 'expired');
  END IF;

  SELECT *
  INTO v_candidate
  FROM public.candidates c
  WHERE c.id = v_share.candidate_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  SELECT *
  INTO v_user
  FROM public.users u
  WHERE u.id = v_candidate.user_id
    AND u.is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  INSERT INTO public.reference_share_views (share_id, viewer_user_id)
  VALUES (v_share.id, auth.uid());

  UPDATE public.reference_passport_shares
  SET view_count = view_count + 1
  WHERE id = v_share.id;

  v_permissions := COALESCE(v_share.permissions, '{}'::JSONB);
  v_show_all :=
    v_share.share_type = 'full_passport'
    OR (
      v_share.share_type = 'selected_references'
      AND cardinality(v_share.included_reference_ids) = 0
    );

  RETURN jsonb_build_object(
    'share_id', v_share.id,
    'share_type', v_share.share_type,
    'view_count', v_share.view_count + 1,
    'permissions', v_permissions,
    'candidate', jsonb_build_object(
      'id', v_candidate.id,
      'vodora_id', v_candidate.vodora_id,
      'name', btrim(v_user.first_name || ' ' || v_user.last_name),
      'title', COALESCE(
        NULLIF(btrim(v_candidate.current_position), ''),
        NULLIF(btrim(v_candidate.profession), ''),
        NULLIF(btrim(v_candidate.headline), '')
      ),
      'city', COALESCE(NULLIF(btrim(v_candidate.city), ''), NULLIF(btrim(v_user.city), '')),
      'country', COALESCE(NULLIF(btrim(v_candidate.country), ''), NULLIF(btrim(v_user.country), '')),
      'profile_picture_url', v_candidate.profile_picture_url
    ),
    'references', COALESCE(
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
        WHERE rr.candidate_id = v_share.candidate_id
          AND rr.status = 'verified'
          AND (
            v_show_all
            OR rr.id = ANY (v_share.included_reference_ids)
          )
      ),
      '[]'::JSONB
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.open_reference_share_link(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_reference_share_link(UUID) TO authenticated;
