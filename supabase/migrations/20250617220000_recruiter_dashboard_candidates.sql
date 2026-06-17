-- Recruiter dashboard: list candidates visible to authenticated recruiters.

CREATE OR REPLACE FUNCTION public.get_recruiter_dashboard_candidates(p_limit INT DEFAULT 50)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_agg(row_data ORDER BY sort_ts DESC)
      FROM (
        SELECT
          c.updated_at AS sort_ts,
          jsonb_build_object(
            'id', c.id,
            'vodora_id', c.vodora_id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'title', COALESCE(
              NULLIF(btrim(c.current_position), ''),
              NULLIF(btrim(c.profession), ''),
              NULLIF(btrim(c.headline), '')
            ),
            'city', COALESCE(NULLIF(btrim(c.city), ''), NULLIF(btrim(u.city), '')),
            'country', COALESCE(NULLIF(btrim(c.country), ''), NULLIF(btrim(u.country), '')),
            'profile_picture_url', c.profile_picture_url,
            'availability_status', c.availability_status,
            'availability_start', c.availability_start,
            'work_types', COALESCE(
              (
                SELECT jsonb_agg(wt.name ORDER BY wt.sort_order, wt.name)
                FROM public.candidate_work_types cwt
                INNER JOIN public.work_types wt ON wt.id = cwt.work_type_id
                WHERE cwt.candidate_id = c.id
                  AND wt.is_active = TRUE
              ),
              '[]'::jsonb
            ),
            'skills', COALESCE(
              (
                SELECT jsonb_agg(cs.skill_name ORDER BY cs.skill_name)
                FROM public.candidate_skills cs
                WHERE cs.candidate_id = c.id
              ),
              '[]'::jsonb
            ),
            'verified', u.email_verified_at IS NOT NULL,
            'reference_count', 0
          ) AS row_data
        FROM public.candidates c
        INNER JOIN public.users u ON u.id = c.user_id
        WHERE EXISTS (
          SELECT 1
          FROM public.recruiters r
          WHERE r.user_id = auth.uid()
        )
          AND c.visibility IN ('recruiters_only', 'public')
          AND u.is_active = TRUE
        ORDER BY c.updated_at DESC
        LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 100))
      ) ranked
    ),
    '[]'::jsonb
  );
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_dashboard_candidates(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_dashboard_candidates(INT) TO authenticated;
