-- Recruiter directory: dynamic specialisation filters from recruiter profiles.

CREATE OR REPLACE FUNCTION public.get_recruiter_directory_filters()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object(
      'specialisations', '[]'::jsonb
    )
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.user_id = auth.uid()
    ) THEN jsonb_build_object(
      'specialisations', '[]'::jsonb
    )
    ELSE jsonb_build_object(
      'specialisations', COALESCE(
        (
          SELECT jsonb_agg(spec ORDER BY spec)
          FROM (
            SELECT DISTINCT btrim(s.value) AS spec
            FROM public.recruiters r
            INNER JOIN public.users u ON u.id = r.user_id
            CROSS JOIN unnest(COALESCE(r.specialisations, '{}'::TEXT[])) AS s(value)
            WHERE u.is_active = TRUE
              AND btrim(s.value) <> ''
          ) specs
        ),
        '[]'::jsonb
      )
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_directory_filters() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_directory_filters() TO authenticated;

CREATE OR REPLACE FUNCTION public.search_recruiters_for_candidates(
  p_query TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_offset INT DEFAULT 0,
  p_limit INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      NULLIF(btrim(p_query), '') AS query,
      NULLIF(btrim(p_category), '') AS specialisation,
      GREATEST(COALESCE(p_offset, 0), 0) AS row_offset,
      LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50) AS page_limit
  ),
  recruiter_rows AS (
    SELECT
      r.id,
      r.user_id,
      r.job_title,
      r.recruiter_type,
      r.bio,
      COALESCE(r.specialisations, '{}'::TEXT[]) AS specialisations,
      COALESCE(r.industries, '{}'::TEXT[]) AS industries,
      r.profile_picture_url,
      r.updated_at,
      u.first_name,
      u.last_name,
      u.email_verified_at,
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
      ) AS company_name,
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
      ) AS placements,
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
      ) AS active_roles
    FROM public.recruiters r
    INNER JOIN public.users u ON u.id = r.user_id
    LEFT JOIN public.companies co ON co.id = r.company_id
    WHERE u.is_active = TRUE
  ),
  filtered AS (
    SELECT rr.*
    FROM recruiter_rows rr
    CROSS JOIN params p
    WHERE (
      p.query IS NULL
      OR rr.first_name ILIKE '%' || p.query || '%'
      OR rr.last_name ILIKE '%' || p.query || '%'
      OR concat_ws(' ', rr.first_name, rr.last_name) ILIKE '%' || p.query || '%'
      OR rr.company_name ILIKE '%' || p.query || '%'
      OR rr.job_title ILIKE '%' || p.query || '%'
      OR EXISTS (
        SELECT 1
        FROM unnest(rr.specialisations) AS spec(value)
        WHERE spec.value ILIKE '%' || p.query || '%'
      )
      OR EXISTS (
        SELECT 1
        FROM unnest(rr.industries) AS ind(value)
        WHERE ind.value ILIKE '%' || p.query || '%'
      )
      OR EXISTS (
        SELECT 1
        FROM public.job_postings jp
        WHERE jp.recruiter_id = rr.id
          AND jp.status = 'published'
          AND jp.title ILIKE '%' || p.query || '%'
      )
    )
    AND (
      p.specialisation IS NULL
      OR EXISTS (
        SELECT 1
        FROM unnest(rr.specialisations) AS spec(value)
        WHERE btrim(spec.value) = p.specialisation
      )
    )
  ),
  total AS (
    SELECT COUNT(*)::INT AS total_count
    FROM filtered
  ),
  paged AS (
    SELECT *
    FROM filtered
    ORDER BY updated_at DESC, last_name ASC, first_name ASC
    OFFSET (SELECT row_offset FROM params)
    LIMIT (SELECT page_limit FROM params)
  )
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object(
      'total_count', 0,
      'recruiters', '[]'::jsonb
    )
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.user_id = auth.uid()
    ) THEN jsonb_build_object(
      'total_count', 0,
      'recruiters', '[]'::jsonb
    )
    ELSE jsonb_build_object(
      'total_count', (SELECT total_count FROM total),
      'recruiters', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'user_id', p.user_id,
              'name', concat_ws(' ', p.first_name, p.last_name),
              'title', COALESCE(NULLIF(btrim(p.job_title), ''), 'Recruiter'),
              'company', p.company_name,
              'location', p.location,
              'profile_picture_url', p.profile_picture_url,
              'verified', p.verified,
              'specialisations', to_jsonb(p.specialisations),
              'industries', to_jsonb(p.industries),
              'recruiter_type', p.recruiter_type,
              'bio', p.bio,
              'placements', p.placements,
              'avg_hire_days', p.avg_hire_days,
              'active_roles', p.active_roles
            )
            ORDER BY p.updated_at DESC, p.last_name ASC, p.first_name ASC
          )
          FROM paged p
        ),
        '[]'::jsonb
      )
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.search_recruiters_for_candidates(
  TEXT, TEXT, INT, INT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.search_recruiters_for_candidates(
  TEXT, TEXT, INT, INT
) TO authenticated;
