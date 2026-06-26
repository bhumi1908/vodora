-- Full recruiter profile for authenticated candidates (single round-trip: profile, stats, roles, connection).

CREATE OR REPLACE FUNCTION public.get_candidate_recruiter_connection_status(
  p_recruiter_id UUID
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    WHEN p_recruiter_id IS NULL THEN NULL
    ELSE (
      SELECT jsonb_build_object(
        'id', conn.id,
        'status', conn.status,
        'initiated_by', conn.initiator_type,
        'connection_type', public.connection_kind(
          conn.participant_1_type,
          conn.participant_2_type
        ),
        'viewer_is_initiator', conn.initiator_candidate_id = viewer.id
      )
      FROM public.connections conn
      INNER JOIN public.candidates viewer ON viewer.user_id = auth.uid()
      WHERE conn.participant_1_type = 'candidate'
        AND conn.participant_2_type = 'recruiter'
        AND conn.participant_1_candidate_id = viewer.id
        AND conn.participant_2_recruiter_id = p_recruiter_id
      LIMIT 1
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_candidate_recruiter_connection_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_recruiter_connection_status(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_recruiter_profile_for_candidate(
  p_recruiter_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_candidate_id UUID;
  v_recruiter_user_id UUID;
BEGIN
  IF auth.uid() IS NULL OR p_recruiter_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT c.id
  INTO v_viewer_candidate_id
  FROM public.candidates c
  INNER JOIN public.users u ON u.id = c.user_id
  WHERE c.user_id = auth.uid()
    AND u.is_active = TRUE;

  IF v_viewer_candidate_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT r.user_id
  INTO v_recruiter_user_id
  FROM public.recruiters r
  INNER JOIN public.users u ON u.id = r.user_id
  WHERE r.id = p_recruiter_id
    AND u.is_active = TRUE;

  IF v_recruiter_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN (
    WITH recruiter_row AS (
      SELECT
        r.id,
        r.user_id,
        r.job_title,
        r.recruiter_type,
        r.bio,
        COALESCE(r.specialisations, '{}'::TEXT[]) AS specialisations,
        COALESCE(r.industries, '{}'::TEXT[]) AS industries,
        COALESCE(r.preferred_work_type_codes, '{}'::TEXT[]) AS preferred_work_type_codes,
        COALESCE(r.preferred_experience_levels, '{}'::TEXT[]) AS preferred_experience_levels,
        r.remote_preference,
        r.profile_picture_url,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.city AS user_city,
        u.country AS user_country,
        u.email_verified_at,
        co.id AS company_id,
        co.name AS company_name,
        co.website AS company_website,
        co.city AS company_city,
        co.country AS company_country,
        COALESCE(co.is_verified, FALSE) AS company_verified,
        COALESCE(
          NULLIF(btrim(co.name), ''),
          (
            SELECT jp.company_display_name
            FROM public.job_postings jp
            WHERE jp.recruiter_id = r.id
              AND jp.status = 'published'
            ORDER BY jp.published_at DESC NULLS LAST, jp.created_at DESC
            LIMIT 1
          ),
          'Independent'
        ) AS display_company_name,
        COALESCE(
          NULLIF(
            concat_ws(
              ', ',
              NULLIF(btrim(u.city), ''),
              NULLIF(btrim(u.country), '')
            ),
            ''
          ),
          NULLIF(
            concat_ws(
              ', ',
              NULLIF(btrim(co.city), ''),
              NULLIF(btrim(co.country), '')
            ),
            ''
          ),
          'Location not listed'
        ) AS location,
        COALESCE(co.is_verified, FALSE) OR u.email_verified_at IS NOT NULL AS verified,
        (
          SELECT COUNT(*)::INT
          FROM public.job_applications ja
          INNER JOIN public.job_postings jp ON jp.id = ja.job_posting_id
          WHERE jp.recruiter_id = r.id
            AND ja.status = 'offer'
        ) AS total_placements,
        (
          SELECT COUNT(*)::INT
          FROM public.job_postings jp
          WHERE jp.recruiter_id = r.id
            AND jp.status = 'published'
        ) AS active_roles_count,
        (
          SELECT COUNT(DISTINCT ja.candidate_id)::INT
          FROM public.job_applications ja
          INNER JOIN public.job_postings jp ON jp.id = ja.job_posting_id
          WHERE jp.recruiter_id = r.id
        ) AS candidates_worked_with,
        (
          SELECT ROUND(AVG(days_to_hire))::INT
          FROM (
            SELECT EXTRACT(
              EPOCH FROM (
                ja.updated_at - COALESCE(jp.published_at, jp.created_at)
              )
            ) / 86400.0 AS days_to_hire
            FROM public.job_applications ja
            INNER JOIN public.job_postings jp ON jp.id = ja.job_posting_id
            WHERE jp.recruiter_id = r.id
              AND ja.status = 'offer'
              AND ja.updated_at >= COALESCE(jp.published_at, jp.created_at)
          ) hire_days
        ) AS avg_hire_days,
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', jp.id,
                'title', jp.title,
                'type', wt.name,
                'location', jp.location,
                'salary', COALESCE(NULLIF(btrim(jp.salary_display), ''), 'Competitive')
              )
              ORDER BY jp.published_at DESC NULLS LAST, jp.created_at DESC
            )
            FROM public.job_postings jp
            INNER JOIN public.work_types wt ON wt.id = jp.work_type_id
            WHERE jp.recruiter_id = r.id
              AND jp.status = 'published'
          ),
          '[]'::jsonb
        ) AS active_roles,
        (
          SELECT jsonb_build_object(
            'id', conn.id,
            'status', conn.status,
            'initiated_by', conn.initiator_type,
            'connection_type', public.connection_kind(
              conn.participant_1_type,
              conn.participant_2_type
            ),
            'viewer_is_initiator', conn.initiator_candidate_id = v_viewer_candidate_id
          )
          FROM public.connections conn
          WHERE conn.participant_1_type = 'candidate'
            AND conn.participant_2_type = 'recruiter'
            AND conn.participant_1_candidate_id = v_viewer_candidate_id
            AND conn.participant_2_recruiter_id = r.id
          LIMIT 1
        ) AS connection
      FROM public.recruiters r
      INNER JOIN public.users u ON u.id = r.user_id
      LEFT JOIN public.companies co ON co.id = r.company_id
      WHERE r.id = p_recruiter_id
    )
    SELECT jsonb_build_object(
      'user',
      jsonb_build_object(
        'id', rr.user_id,
        'first_name', rr.first_name,
        'last_name', rr.last_name,
        'email', rr.email,
        'phone', rr.phone,
        'city', rr.user_city,
        'country', rr.user_country,
        'email_verified_at', rr.email_verified_at
      ),
      'recruiter',
      jsonb_build_object(
        'id', rr.id,
        'job_title', rr.job_title,
        'bio', rr.bio,
        'recruiter_type', rr.recruiter_type,
        'specialisations', to_jsonb(rr.specialisations),
        'industries', to_jsonb(rr.industries),
        'preferred_work_type_codes', to_jsonb(rr.preferred_work_type_codes),
        'preferred_experience_levels', to_jsonb(rr.preferred_experience_levels),
        'remote_preference', rr.remote_preference,
        'profile_picture_url', rr.profile_picture_url
      ),
      'company',
      CASE
        WHEN rr.company_id IS NULL THEN NULL
        ELSE jsonb_build_object(
          'id', rr.company_id,
          'name', rr.company_name,
          'website', rr.company_website,
          'city', rr.company_city,
          'country', rr.company_country,
          'is_verified', rr.company_verified
        )
      END,
      'display_company_name', rr.display_company_name,
      'location', rr.location,
      'verified', rr.verified,
      'stats', jsonb_build_object(
        'total_placements', rr.total_placements,
        'active_roles', rr.active_roles_count,
        'candidates_worked_with', rr.candidates_worked_with,
        'avg_time_to_hire_days', rr.avg_hire_days
      ),
      'active_roles', rr.active_roles,
      'connection', rr.connection
    )
    FROM recruiter_row rr
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_profile_for_candidate(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_profile_for_candidate(UUID) TO authenticated;
