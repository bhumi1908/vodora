-- Recruiter ↔ candidate connections (phase 1: pending + connected).

CREATE TABLE public.recruiter_candidate_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  initiated_by VARCHAR(20) NOT NULL,
  message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recruiter_candidate_connections_recruiter_id_candidate_id_key
    UNIQUE (recruiter_id, candidate_id),
  CONSTRAINT recruiter_candidate_connections_status_check CHECK (
    status IN ('pending', 'connected')
  ),
  CONSTRAINT recruiter_candidate_connections_initiated_by_check CHECK (
    initiated_by IN ('candidate', 'recruiter')
  ),
  CONSTRAINT recruiter_candidate_connections_message_length_check CHECK (
    message IS NULL OR char_length(message) <= 2000
  )
);

CREATE INDEX recruiter_candidate_connections_recruiter_id_status_idx
  ON public.recruiter_candidate_connections (recruiter_id, status);

CREATE INDEX recruiter_candidate_connections_candidate_id_status_idx
  ON public.recruiter_candidate_connections (candidate_id, status);

CREATE INDEX recruiter_candidate_connections_recruiter_pending_idx
  ON public.recruiter_candidate_connections (recruiter_id, requested_at DESC)
  WHERE status = 'pending';

CREATE INDEX recruiter_candidate_connections_candidate_pending_idx
  ON public.recruiter_candidate_connections (candidate_id, requested_at DESC)
  WHERE status = 'pending';

CREATE INDEX recruiter_candidate_connections_recruiter_connected_idx
  ON public.recruiter_candidate_connections (recruiter_id)
  WHERE status = 'connected';

CREATE INDEX recruiter_candidate_connections_candidate_connected_idx
  ON public.recruiter_candidate_connections (candidate_id)
  WHERE status = 'connected';

CREATE TRIGGER recruiter_candidate_connections_set_updated_at
  BEFORE UPDATE ON public.recruiter_candidate_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_connection_connected_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'connected' AND OLD.status IS DISTINCT FROM 'connected' THEN
    NEW.connected_at = COALESCE(NEW.connected_at, now());
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER recruiter_candidate_connections_set_connected_at
  BEFORE UPDATE OF status ON public.recruiter_candidate_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_connection_connected_at();

ALTER TABLE public.recruiter_candidate_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY recruiter_candidate_connections_select_participant
  ON public.recruiter_candidate_connections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = recruiter_candidate_connections.candidate_id
        AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = recruiter_candidate_connections.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY recruiter_candidate_connections_insert_candidate
  ON public.recruiter_candidate_connections
  FOR INSERT TO authenticated
  WITH CHECK (
    initiated_by = 'candidate'
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE c.id = recruiter_candidate_connections.candidate_id
        AND c.user_id = auth.uid()
        AND u.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1
      FROM public.recruiters r
      INNER JOIN public.users u ON u.id = r.user_id
      WHERE r.id = recruiter_candidate_connections.recruiter_id
        AND u.is_active = TRUE
    )
  );

CREATE POLICY recruiter_candidate_connections_insert_recruiter
  ON public.recruiter_candidate_connections
  FOR INSERT TO authenticated
  WITH CHECK (
    initiated_by = 'recruiter'
    AND EXISTS (
      SELECT 1
      FROM public.recruiters r
      INNER JOIN public.users u ON u.id = r.user_id
      WHERE r.id = recruiter_candidate_connections.recruiter_id
        AND r.user_id = auth.uid()
        AND u.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE c.id = recruiter_candidate_connections.candidate_id
        AND u.is_active = TRUE
    )
  );

CREATE OR REPLACE FUNCTION public.send_candidate_connection_request(
  p_recruiter_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_id UUID;
  v_connection_id UUID;
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT c.id
  INTO v_candidate_id
  FROM public.candidates c
  INNER JOIN public.users u ON u.id = c.user_id
  WHERE c.user_id = auth.uid()
    AND u.is_active = TRUE;

  IF v_candidate_id IS NULL THEN
    RAISE EXCEPTION 'Candidate profile not found';
  END IF;

  IF p_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'Recruiter id is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    INNER JOIN public.users u ON u.id = r.user_id
    WHERE r.id = p_recruiter_id
      AND u.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Recruiter not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.id = p_recruiter_id
      AND r.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cannot connect to yourself';
  END IF;

  INSERT INTO public.recruiter_candidate_connections (
    recruiter_id,
    candidate_id,
    status,
    initiated_by,
    message
  )
  VALUES (
    p_recruiter_id,
    v_candidate_id,
    'pending',
    'candidate',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT (recruiter_id, candidate_id) DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT rcc.id, rcc.status
    INTO v_connection_id, v_status
    FROM public.recruiter_candidate_connections rcc
    WHERE rcc.recruiter_id = p_recruiter_id
      AND rcc.candidate_id = v_candidate_id;

    RETURN jsonb_build_object(
      'id', v_connection_id,
      'status', v_status,
      'already_exists', TRUE
    );
  END IF;

  RETURN jsonb_build_object(
    'id', v_connection_id,
    'status', v_status,
    'already_exists', FALSE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.send_candidate_connection_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_candidate_connection_request(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_candidate_connection_counts()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object(
      'pending', 0,
      'connected', 0,
      'total', 0
    )
    ELSE COALESCE(
      (
        SELECT jsonb_build_object(
          'pending', COUNT(*) FILTER (WHERE rcc.status = 'pending')::INT,
          'connected', COUNT(*) FILTER (WHERE rcc.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.recruiter_candidate_connections rcc
        INNER JOIN public.candidates c ON c.id = rcc.candidate_id
        WHERE c.user_id = auth.uid()
      ),
      jsonb_build_object('pending', 0, 'connected', 0, 'total', 0)
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_candidate_connection_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_connection_counts() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_recruiter_connection_counts()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object(
      'pending', 0,
      'connected', 0,
      'total', 0
    )
    ELSE COALESCE(
      (
        SELECT jsonb_build_object(
          'pending', COUNT(*) FILTER (WHERE rcc.status = 'pending')::INT,
          'connected', COUNT(*) FILTER (WHERE rcc.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.recruiter_candidate_connections rcc
        INNER JOIN public.recruiters r ON r.id = rcc.recruiter_id
        WHERE r.user_id = auth.uid()
      ),
      jsonb_build_object('pending', 0, 'connected', 0, 'total', 0)
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_connection_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_connection_counts() TO authenticated;

-- Include per-recruiter connection status in candidate directory search.
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
    SELECT c.id AS candidate_id
    FROM public.candidates c
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
        SELECT rcc.status
        FROM public.recruiter_candidate_connections rcc
        CROSS JOIN viewer v
        WHERE rcc.recruiter_id = r.id
          AND rcc.candidate_id = v.candidate_id
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
              'active_roles', p.active_roles,
              'connection_status', p.connection_status
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
