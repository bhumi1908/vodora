-- Proximity + availability sort for directory search RPCs.
-- Candidate searches: tier 0 = nearby + looking, tier 1 = other looking, tier 2 = all not looking.
-- Recruiter directory: tier 0 = nearby, tier 1 = everyone else.

CREATE OR REPLACE FUNCTION public.candidate_search_sort_rank(
  p_candidate_city TEXT,
  p_candidate_country TEXT,
  p_candidate_availability_status TEXT,
  p_viewer_city TEXT,
  p_viewer_country TEXT
)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN NULLIF(btrim(p_viewer_city), '') IS NOT NULL
      AND NULLIF(btrim(p_viewer_country), '') IS NOT NULL
      AND NULLIF(btrim(p_candidate_city), '') IS NOT NULL
      AND NULLIF(btrim(p_candidate_country), '') IS NOT NULL
      AND lower(btrim(p_candidate_city)) = lower(btrim(p_viewer_city))
      AND lower(btrim(p_candidate_country)) = lower(btrim(p_viewer_country))
      AND p_candidate_availability_status <> 'not_looking'
    THEN 0
    WHEN p_candidate_availability_status <> 'not_looking' THEN 1
    ELSE 2
  END;
$$;

CREATE OR REPLACE FUNCTION public.location_proximity_sort_rank(
  p_target_city TEXT,
  p_target_country TEXT,
  p_viewer_city TEXT,
  p_viewer_country TEXT
)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN NULLIF(btrim(p_viewer_city), '') IS NOT NULL
      AND NULLIF(btrim(p_viewer_country), '') IS NOT NULL
      AND NULLIF(btrim(p_target_city), '') IS NOT NULL
      AND NULLIF(btrim(p_target_country), '') IS NOT NULL
      AND lower(btrim(p_target_city)) = lower(btrim(p_viewer_city))
      AND lower(btrim(p_target_country)) = lower(btrim(p_viewer_country))
    THEN 0
    ELSE 1
  END;
$$;

-- ---------------------------------------------------------------------------
-- search_candidates_for_candidates
-- ---------------------------------------------------------------------------

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
        SELECT
          c.id AS candidate_id,
          COALESCE(NULLIF(btrim(c.city), ''), NULLIF(btrim(u.city), '')) AS viewer_city,
          COALESCE(NULLIF(btrim(c.country), ''), NULLIF(btrim(u.country), '')) AS viewer_country
        FROM public.candidates c
        INNER JOIN public.users u ON u.id = c.user_id
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
          public.count_verified_references(c.id) AS reference_count,
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
            OR public.count_verified_references(c.id) >= p_min_references
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
      ranked AS (
        SELECT
          f.*,
          public.candidate_search_sort_rank(
            f.city,
            f.country,
            f.availability_status,
            v.viewer_city,
            v.viewer_country
          ) AS sort_rank
        FROM filtered f
        CROSS JOIN viewer v
      ),
      page AS (
        SELECT *
        FROM ranked
        ORDER BY sort_rank ASC, sort_ts DESC
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
              ORDER BY p.sort_rank ASC, p.sort_ts DESC
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

-- ---------------------------------------------------------------------------
-- search_recruiter_candidates
-- ---------------------------------------------------------------------------

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
      WITH viewer AS (
        SELECT
          COALESCE(NULLIF(btrim(u.city), ''), NULLIF(btrim(co.city), '')) AS viewer_city,
          COALESCE(NULLIF(btrim(u.country), ''), NULLIF(btrim(co.country), '')) AS viewer_country
        FROM public.recruiters r
        INNER JOIN public.users u ON u.id = r.user_id
        LEFT JOIN public.companies co ON co.id = r.company_id
        WHERE r.user_id = auth.uid()
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
          public.count_verified_references(c.id) AS reference_count
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
            OR public.count_verified_references(c.id) >= p_min_references
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
      ranked AS (
        SELECT
          f.*,
          public.candidate_search_sort_rank(
            f.city,
            f.country,
            f.availability_status,
            v.viewer_city,
            v.viewer_country
          ) AS sort_rank
        FROM filtered f
        CROSS JOIN viewer v
      ),
      page AS (
        SELECT *
        FROM ranked
        ORDER BY sort_rank ASC, sort_ts DESC
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
      ),
      saved_flags AS (
        SELECT rsc.candidate_id
        FROM public.recruiter_saved_candidates rsc
        INNER JOIN public.recruiters r ON r.id = rsc.recruiter_id
        WHERE r.user_id = auth.uid()
          AND rsc.candidate_id IN (SELECT id FROM page)
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
                'is_saved', (sf.candidate_id IS NOT NULL)
              )
              ORDER BY p.sort_rank ASC, p.sort_ts DESC
            )
            FROM page p
            LEFT JOIN work_types_agg wt ON wt.candidate_id = p.id
            LEFT JOIN skills_agg sk ON sk.candidate_id = p.id
            LEFT JOIN saved_flags sf ON sf.candidate_id = p.id
          ),
          '[]'::jsonb
        )
      )
    )
  END;
$$;

-- ---------------------------------------------------------------------------
-- search_recruiters_for_candidates
-- ---------------------------------------------------------------------------

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
      NULLIF(btrim(p_category), '') AS category,
      GREATEST(COALESCE(p_offset, 0), 0) AS row_offset,
      LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50) AS page_limit
  ),
  viewer AS (
    SELECT
      c.id AS candidate_id,
      COALESCE(NULLIF(btrim(c.city), ''), NULLIF(btrim(u.city), '')) AS viewer_city,
      COALESCE(NULLIF(btrim(c.country), ''), NULLIF(btrim(u.country), '')) AS viewer_country
    FROM public.candidates c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.user_id = auth.uid()
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
      COALESCE(NULLIF(btrim(u.city), ''), NULLIF(btrim(co.city), '')) AS city,
      COALESCE(NULLIF(btrim(u.country), ''), NULLIF(btrim(co.country), '')) AS country,
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
      ) AS active_roles,
      (
        SELECT conn.status
        FROM public.connections conn
        CROSS JOIN viewer v
        WHERE conn.participant_1_type = 'candidate'
          AND conn.participant_2_type = 'recruiter'
          AND conn.participant_1_candidate_id = v.candidate_id
          AND conn.participant_2_recruiter_id = r.id
      ) AS connection_status
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
      p.category IS NULL
      OR p.category = 'All'
      OR (
        p.category = 'Labour Hire'
        AND rr.recruiter_type = 'labour_hire_company'
      )
      OR (
        p.category <> 'Labour Hire'
        AND (
          EXISTS (
            SELECT 1
            FROM unnest(rr.specialisations) AS spec(value)
            WHERE spec.value ILIKE '%' || p.category || '%'
          )
          OR EXISTS (
            SELECT 1
            FROM unnest(rr.industries) AS ind(value)
            WHERE ind.value ILIKE '%' || p.category || '%'
          )
          OR EXISTS (
            SELECT 1
            FROM public.job_postings jp
            WHERE jp.recruiter_id = rr.id
              AND jp.status = 'published'
              AND (
                (p.category = 'Technology' AND jp.category IN ('Technology', 'Product'))
                OR (p.category = 'Finance' AND jp.category = 'Accounting & Finance')
                OR (p.category = 'Healthcare' AND jp.category = 'Healthcare')
                OR (p.category = 'Engineering' AND jp.category = 'Engineering')
                OR (
                  p.category = 'Marketing & Design'
                  AND jp.category IN ('Marketing', 'Design')
                )
              )
          )
          OR (
            p.category = 'Technology'
            AND (
              EXISTS (
                SELECT 1
                FROM unnest(rr.specialisations) AS spec(value)
                WHERE spec.value ILIKE ANY (
                  ARRAY[
                    '%software%',
                    '%devops%',
                    '%data%',
                    '%product%',
                    '%cloud%'
                  ]
                )
              )
              OR EXISTS (
                SELECT 1
                FROM unnest(rr.industries) AS ind(value)
                WHERE ind.value ILIKE ANY (
                  ARRAY['%technology%', '%saas%', '%fintech%']
                )
              )
            )
          )
          OR (
            p.category = 'Finance'
            AND (
              EXISTS (
                SELECT 1
                FROM unnest(rr.specialisations) AS spec(value)
                WHERE spec.value ILIKE ANY (
                  ARRAY['%finance%', '%accounting%', '%risk%']
                )
              )
              OR EXISTS (
                SELECT 1
                FROM unnest(rr.industries) AS ind(value)
                WHERE ind.value ILIKE ANY (
                  ARRAY['%finance%', '%banking%', '%insurance%']
                )
              )
            )
          )
          OR (
            p.category = 'Marketing & Design'
            AND (
              EXISTS (
                SELECT 1
                FROM unnest(rr.specialisations) AS spec(value)
                WHERE spec.value ILIKE ANY (
                  ARRAY['%marketing%', '%design%', '%ux%', '%brand%', '%content%']
                )
              )
              OR EXISTS (
                SELECT 1
                FROM unnest(rr.industries) AS ind(value)
                WHERE ind.value ILIKE ANY (
                  ARRAY['%marketing%', '%design%', '%media%', '%creative%']
                )
              )
            )
          )
        )
      )
    )
  ),
  total AS (
    SELECT COUNT(*)::INT AS total_count
    FROM filtered
  ),
  ranked AS (
    SELECT
      f.*,
      public.location_proximity_sort_rank(
        f.city,
        f.country,
        v.viewer_city,
        v.viewer_country
      ) AS sort_rank
    FROM filtered f
    CROSS JOIN viewer v
  ),
  paged AS (
    SELECT *
    FROM ranked
    ORDER BY sort_rank ASC, updated_at DESC, last_name ASC, first_name ASC
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
              'active_roles', p.active_roles,
              'connection_status', p.connection_status
            )
            ORDER BY p.sort_rank ASC, p.updated_at DESC, p.last_name ASC, p.first_name ASC
          )
          FROM paged p
        ),
        '[]'::jsonb
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

REVOKE ALL ON FUNCTION public.search_recruiter_candidates(
  TEXT, UUID, TEXT, TEXT, TEXT[], TEXT, INT, INT, INT, INT, INT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_recruiter_candidates(
  TEXT, UUID, TEXT, TEXT, TEXT[], TEXT, INT, INT, INT, INT, INT
) TO authenticated;

REVOKE ALL ON FUNCTION public.search_recruiters_for_candidates(
  TEXT, TEXT, INT, INT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.search_recruiters_for_candidates(
  TEXT, TEXT, INT, INT
) TO authenticated;
