-- Candidate directory search: browse peers for networking / connections.
-- Excludes the logged-in candidate from results.

CREATE OR REPLACE FUNCTION public.get_candidate_search_metadata()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.user_id = auth.uid()
    ) THEN jsonb_build_object(
      'total_directory_count', (
        SELECT COUNT(*)
        FROM public.candidates c
        INNER JOIN public.users u ON u.id = c.user_id
        INNER JOIN public.candidates viewer ON viewer.user_id = auth.uid()
        WHERE c.visibility IN ('recruiters_only', 'public')
          AND u.is_active = TRUE
          AND c.id <> viewer.id
      ),
      'countries', COALESCE(
        (
          SELECT jsonb_agg(DISTINCT country_name ORDER BY country_name)
          FROM (
            SELECT COALESCE(
              NULLIF(btrim(c.country), ''),
              NULLIF(btrim(u.country), '')
            ) AS country_name
            FROM public.candidates c
            INNER JOIN public.users u ON u.id = c.user_id
            INNER JOIN public.candidates viewer ON viewer.user_id = auth.uid()
            WHERE c.visibility IN ('recruiters_only', 'public')
              AND u.is_active = TRUE
              AND c.id <> viewer.id
          ) locations
          WHERE country_name IS NOT NULL
        ),
        '[]'::jsonb
      )
    )
    ELSE jsonb_build_object(
      'total_directory_count', 0,
      'countries', '[]'::jsonb
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_candidate_search_metadata() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_search_metadata() TO authenticated;

CREATE OR REPLACE FUNCTION public.search_candidates_for_candidates(
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
      FROM public.candidates c
      WHERE c.user_id = auth.uid()
    ) THEN jsonb_build_object(
      'total_count', 0,
      'candidates', '[]'::jsonb
    )
    ELSE (
      WITH viewer AS (
        SELECT c.id AS candidate_id
        FROM public.candidates c
        WHERE c.user_id = auth.uid()
      ),
      filtered AS (
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
          0::INT AS reference_count,
          (
            SELECT conn.status
            FROM public.connections conn
            CROSS JOIN viewer v
            WHERE conn.participant_1_type = 'candidate'
              AND conn.participant_2_type = 'candidate'
              AND v.candidate_id IN (
                conn.participant_1_candidate_id,
                conn.participant_2_candidate_id
              )
              AND c.id IN (
                conn.participant_1_candidate_id,
                conn.participant_2_candidate_id
              )
            LIMIT 1
          ) AS connection_status
        FROM public.candidates c
        INNER JOIN public.users u ON u.id = c.user_id
        CROSS JOIN viewer v
        LEFT JOIN public.industry_categories ic ON ic.id = c.industry_category_id
        WHERE c.visibility IN ('recruiters_only', 'public')
          AND u.is_active = TRUE
          AND c.id <> v.candidate_id
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
      ),
      page AS (
        SELECT *
        FROM filtered
        ORDER BY sort_ts DESC
        OFFSET GREATEST(COALESCE(p_offset, 0), 0)
        LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 50))
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
      )
      SELECT jsonb_build_object(
        'total_count', (SELECT COUNT(*)::bigint FROM filtered),
        'candidates', COALESCE(
          (
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
                'total_years_experience', p.total_years_experience,
                'category', p.category,
                'work_types', COALESCE(wt.work_types, '[]'::jsonb),
                'skills', COALESCE(sk.skills, '[]'::jsonb),
                'verified', p.verified,
                'reference_count', p.reference_count,
                'connection_status', p.connection_status
              )
              ORDER BY p.sort_ts DESC
            )
            FROM page p
            LEFT JOIN work_types_agg wt ON wt.candidate_id = p.id
            LEFT JOIN skills_agg sk ON sk.candidate_id = p.id
          ),
          '[]'::jsonb
        )
      )
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.search_candidates_for_candidates(
  TEXT, UUID, TEXT, TEXT, TEXT[], TEXT, INT, INT, INT, INT, INT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_candidates_for_candidates(
  TEXT, UUID, TEXT, TEXT, TEXT[], TEXT, INT, INT, INT, INT, INT
) TO authenticated;
