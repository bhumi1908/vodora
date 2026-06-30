-- Include industry category lookup data in candidate/recruiter search metadata RPCs.
-- Categories are sourced from industry_categories (id + name), not free-text labels.

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
      ),
      'categories', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object('id', ic.id, 'name', ic.name)
            ORDER BY ic.sort_order, ic.name
          )
          FROM public.industry_categories ic
          WHERE ic.is_active = TRUE
        ),
        '[]'::jsonb
      )
    )
    ELSE jsonb_build_object(
      'total_directory_count', 0,
      'countries', '[]'::jsonb,
      'categories', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object('id', ic.id, 'name', ic.name)
            ORDER BY ic.sort_order, ic.name
          )
          FROM public.industry_categories ic
          WHERE ic.is_active = TRUE
        ),
        '[]'::jsonb
      )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_recruiter_search_metadata()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.user_id = auth.uid()
    ) THEN jsonb_build_object(
      'total_directory_count', (
        SELECT COUNT(*)
        FROM public.candidates c
        INNER JOIN public.users u ON u.id = c.user_id
        WHERE c.visibility IN ('recruiters_only', 'public')
          AND u.is_active = TRUE
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
            WHERE c.visibility IN ('recruiters_only', 'public')
              AND u.is_active = TRUE
          ) locations
          WHERE country_name IS NOT NULL
        ),
        '[]'::jsonb
      ),
      'categories', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object('id', ic.id, 'name', ic.name)
            ORDER BY ic.sort_order, ic.name
          )
          FROM public.industry_categories ic
          WHERE ic.is_active = TRUE
        ),
        '[]'::jsonb
      )
    )
    ELSE jsonb_build_object(
      'total_directory_count', 0,
      'countries', '[]'::jsonb,
      'categories', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object('id', ic.id, 'name', ic.name)
            ORDER BY ic.sort_order, ic.name
          )
          FROM public.industry_categories ic
          WHERE ic.is_active = TRUE
        ),
        '[]'::jsonb
      )
    )
  END;
$$;
