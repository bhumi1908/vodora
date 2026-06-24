-- Recruiter dashboard: show a small random sample of email-verified candidates.

CREATE OR REPLACE FUNCTION public.get_recruiter_dashboard_candidates(p_limit INT DEFAULT 7)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.user_id = auth.uid()
    ) THEN '[]'::jsonb
    ELSE COALESCE(
      (
        WITH page AS (
          SELECT
            c.id,
            random() AS sort_key,
            c.vodora_id,
            u.first_name,
            u.last_name,
            COALESCE(
              NULLIF(btrim(c.current_position), ''),
              NULLIF(btrim(c.profession), ''),
              NULLIF(btrim(c.headline), '')
            ) AS title,
            COALESCE(NULLIF(btrim(c.city), ''), NULLIF(btrim(u.city), '')) AS city,
            COALESCE(NULLIF(btrim(c.country), ''), NULLIF(btrim(u.country), '')) AS country,
            c.profile_picture_url,
            c.availability_status,
            c.availability_start,
            TRUE AS verified
          FROM public.candidates c
          INNER JOIN public.users u ON u.id = c.user_id
          WHERE c.visibility IN ('recruiters_only', 'public')
            AND u.is_active = TRUE
            AND u.email_verified_at IS NOT NULL
          ORDER BY random()
          LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 7), 7))
        ),
        work_types_agg AS (
          SELECT
            cwt.candidate_id,
            jsonb_agg(wt.name ORDER BY wt.sort_order, wt.name) AS work_types
          FROM public.candidate_work_types cwt
          INNER JOIN public.work_types wt ON wt.id = cwt.work_type_id
          WHERE cwt.candidate_id IN (SELECT id FROM page)
            AND wt.is_active = TRUE
          GROUP BY cwt.candidate_id
        ),
        skills_agg AS (
          SELECT
            cs.candidate_id,
            jsonb_agg(cs.skill_name ORDER BY cs.skill_name) AS skills
          FROM public.candidate_skills cs
          WHERE cs.candidate_id IN (SELECT id FROM page)
          GROUP BY cs.candidate_id
        ),
        saved_flags AS (
          SELECT rsc.candidate_id
          FROM public.recruiter_saved_candidates rsc
          INNER JOIN public.recruiters r ON r.id = rsc.recruiter_id
          WHERE r.user_id = auth.uid()
            AND rsc.candidate_id IN (SELECT id FROM page)
        )
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'vodora_id', p.vodora_id,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'title', p.title,
            'city', p.city,
            'country', p.country,
            'profile_picture_url', p.profile_picture_url,
            'availability_status', p.availability_status,
            'availability_start', p.availability_start,
            'work_types', COALESCE(wt.work_types, '[]'::jsonb),
            'skills', COALESCE(sk.skills, '[]'::jsonb),
            'verified', p.verified,
            'reference_count', public.count_verified_references(p.id),
            'is_saved', (sf.candidate_id IS NOT NULL)
          )
          ORDER BY p.sort_key
        )
        FROM page p
        LEFT JOIN work_types_agg wt ON wt.candidate_id = p.id
        LEFT JOIN skills_agg sk ON sk.candidate_id = p.id
        LEFT JOIN saved_flags sf ON sf.candidate_id = p.id
      ),
      '[]'::jsonb
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_dashboard_candidates(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_dashboard_candidates(INT) TO authenticated;
