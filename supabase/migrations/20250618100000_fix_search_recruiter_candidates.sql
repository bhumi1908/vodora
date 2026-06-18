-- Fix: replace temp table (not allowed in STABLE functions) with CTEs.

CREATE OR REPLACE FUNCTION public.search_recruiter_candidates(
  p_query TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_availability_start TEXT DEFAULT NULL,
  p_availability_status TEXT DEFAULT NULL,
  p_work_type_codes TEXT[] DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_experience_min INT DEFAULT NULL,
  p_experience_max INT DEFAULT NULL,
  p_min_references INT DEFAULT NULL,
  p_offset INT DEFAULT 0,
  p_limit INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.user_id = auth.uid()
    ) THEN jsonb_build_object(
      'total_count', 0,
      'candidates', '[]'::jsonb
    )
    ELSE (
      WITH filtered AS (
        SELECT
          c.id,
          c.vodora_id,
          c.updated_at AS sort_ts,
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
          c.total_years_experience,
          ic.name AS category,
          u.email_verified_at IS NOT NULL AS verified,
          0::INT AS reference_count
        FROM public.candidates c
        INNER JOIN public.users u ON u.id = c.user_id
        LEFT JOIN public.industry_categories ic ON ic.id = c.industry_category_id
        WHERE c.visibility IN ('recruiters_only', 'public')
          AND u.is_active = TRUE
          AND (p_category_id IS NULL OR c.industry_category_id = p_category_id)
          AND (
            NULLIF(btrim(p_availability_start), '') IS NULL
            OR c.availability_start = NULLIF(btrim(p_availability_start), '')
            OR (
              NULLIF(btrim(p_availability_start), '') = 'Immediately'
              AND (
                c.availability_start = 'Immediately'
                OR c.availability_status = 'available_now'
              )
            )
          )
          AND (
            NULLIF(btrim(p_availability_status), '') IS NULL
            OR c.availability_status = NULLIF(btrim(p_availability_status), '')
          )
          AND (
            NULLIF(btrim(p_country), '') IS NULL
            OR COALESCE(NULLIF(btrim(c.country), ''), NULLIF(btrim(u.country), ''))
              ILIKE NULLIF(btrim(p_country), '')
          )
          AND (
            p_experience_min IS NULL
            OR COALESCE(c.total_years_experience, 0) >= p_experience_min
          )
          AND (
            p_experience_max IS NULL
            OR COALESCE(c.total_years_experience, 0) <= p_experience_max
          )
          AND (
            p_min_references IS NULL
            OR 0 >= p_min_references
          )
          AND (
            p_work_type_codes IS NULL
            OR cardinality(p_work_type_codes) = 0
            OR EXISTS (
              SELECT 1
              FROM public.candidate_work_types cwt
              INNER JOIN public.work_types wt ON wt.id = cwt.work_type_id
              WHERE cwt.candidate_id = c.id
                AND wt.is_active = TRUE
                AND wt.code = ANY (p_work_type_codes)
            )
          )
          AND (
            NULLIF(btrim(p_query), '') IS NULL
            OR u.first_name ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR u.last_name ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR (u.first_name || ' ' || u.last_name) ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR COALESCE(c.current_position, '') ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR COALESCE(c.profession, '') ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR COALESCE(c.headline, '') ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR COALESCE(c.city, u.city, '') ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR COALESCE(c.country, u.country, '') ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            OR EXISTS (
              SELECT 1
              FROM public.candidate_skills cs
              WHERE cs.candidate_id = c.id
                AND cs.skill_name ILIKE '%' || NULLIF(btrim(p_query), '') || '%'
            )
          )
      )
      SELECT jsonb_build_object(
        'total_count', (SELECT COUNT(*)::bigint FROM filtered),
        'candidates', COALESCE(
          (
            SELECT jsonb_agg(row_data ORDER BY sort_ts DESC)
            FROM (
              SELECT
                f.sort_ts,
                jsonb_build_object(
                  'id', f.id,
                  'vodora_id', f.vodora_id,
                  'first_name', f.first_name,
                  'last_name', f.last_name,
                  'title', f.title,
                  'city', f.city,
                  'country', f.country,
                  'profile_picture_url', f.profile_picture_url,
                  'availability_status', f.availability_status,
                  'availability_start', f.availability_start,
                  'total_years_experience', f.total_years_experience,
                  'category', f.category,
                  'work_types', COALESCE(
                    (
                      SELECT jsonb_agg(wt.name ORDER BY wt.sort_order, wt.name)
                      FROM public.candidate_work_types cwt
                      INNER JOIN public.work_types wt ON wt.id = cwt.work_type_id
                      WHERE cwt.candidate_id = f.id
                        AND wt.is_active = TRUE
                    ),
                    '[]'::jsonb
                  ),
                  'skills', COALESCE(
                    (
                      SELECT jsonb_agg(cs.skill_name ORDER BY cs.skill_name)
                      FROM public.candidate_skills cs
                      WHERE cs.candidate_id = f.id
                    ),
                    '[]'::jsonb
                  ),
                  'verified', f.verified,
                  'reference_count', f.reference_count
                ) AS row_data
              FROM filtered f
              ORDER BY f.sort_ts DESC
              OFFSET GREATEST(COALESCE(p_offset, 0), 0)
              LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 50))
            ) page_rows
          ),
          '[]'::jsonb
        )
      )
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.search_recruiter_candidates(
  TEXT, UUID, TEXT, TEXT, TEXT[], TEXT, INT, INT, INT, INT, INT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.search_recruiter_candidates(
  TEXT, UUID, TEXT, TEXT, TEXT[], TEXT, INT, INT, INT, INT, INT
) TO authenticated;
