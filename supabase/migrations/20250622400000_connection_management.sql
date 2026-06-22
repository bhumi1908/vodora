-- Connection management: list, respond, recruiter-initiated requests, enriched counts.

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
      'pending_received', 0,
      'pending_sent', 0,
      'connected', 0,
      'total', 0
    )
    ELSE COALESCE(
      (
        SELECT jsonb_build_object(
          'pending', COUNT(*) FILTER (WHERE rcc.status = 'pending')::INT,
          'pending_received', COUNT(*) FILTER (
            WHERE rcc.status = 'pending' AND rcc.initiated_by = 'recruiter'
          )::INT,
          'pending_sent', COUNT(*) FILTER (
            WHERE rcc.status = 'pending' AND rcc.initiated_by = 'candidate'
          )::INT,
          'connected', COUNT(*) FILTER (WHERE rcc.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.recruiter_candidate_connections rcc
        INNER JOIN public.candidates c ON c.id = rcc.candidate_id
        WHERE c.user_id = auth.uid()
      ),
      jsonb_build_object(
        'pending', 0,
        'pending_received', 0,
        'pending_sent', 0,
        'connected', 0,
        'total', 0
      )
    )
  END;
$$;

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
      'pending_received', 0,
      'pending_sent', 0,
      'connected', 0,
      'total', 0
    )
    ELSE COALESCE(
      (
        SELECT jsonb_build_object(
          'pending', COUNT(*) FILTER (WHERE rcc.status = 'pending')::INT,
          'pending_received', COUNT(*) FILTER (
            WHERE rcc.status = 'pending' AND rcc.initiated_by = 'candidate'
          )::INT,
          'pending_sent', COUNT(*) FILTER (
            WHERE rcc.status = 'pending' AND rcc.initiated_by = 'recruiter'
          )::INT,
          'connected', COUNT(*) FILTER (WHERE rcc.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.recruiter_candidate_connections rcc
        INNER JOIN public.recruiters r ON r.id = rcc.recruiter_id
        WHERE r.user_id = auth.uid()
      ),
      jsonb_build_object(
        'pending', 0,
        'pending_received', 0,
        'pending_sent', 0,
        'connected', 0,
        'total', 0
      )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.send_recruiter_connection_request(
  p_candidate_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id UUID;
  v_connection_id UUID;
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT r.id
  INTO v_recruiter_id
  FROM public.recruiters r
  INNER JOIN public.users u ON u.id = r.user_id
  WHERE r.user_id = auth.uid()
    AND u.is_active = TRUE;

  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'Recruiter profile not found';
  END IF;

  IF p_candidate_id IS NULL THEN
    RAISE EXCEPTION 'Candidate id is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.candidates c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.id = p_candidate_id
      AND c.visibility IN ('recruiters_only', 'public')
      AND u.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.candidates c
    WHERE c.id = p_candidate_id
      AND c.user_id = auth.uid()
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
    v_recruiter_id,
    p_candidate_id,
    'pending',
    'recruiter',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT (recruiter_id, candidate_id) DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT rcc.id, rcc.status
    INTO v_connection_id, v_status
    FROM public.recruiter_candidate_connections rcc
    WHERE rcc.recruiter_id = v_recruiter_id
      AND rcc.candidate_id = p_candidate_id;

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

REVOKE ALL ON FUNCTION public.send_recruiter_connection_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_recruiter_connection_request(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_recruiter_candidate_connection_status(
  p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    WHEN p_candidate_id IS NULL THEN NULL
    ELSE (
      SELECT jsonb_build_object(
        'id', rcc.id,
        'status', rcc.status,
        'initiated_by', rcc.initiated_by
      )
      FROM public.recruiter_candidate_connections rcc
      INNER JOIN public.recruiters r ON r.id = rcc.recruiter_id
      WHERE r.user_id = auth.uid()
        AND rcc.candidate_id = p_candidate_id
      LIMIT 1
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_candidate_connection_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_candidate_connection_status(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_to_connection_request(
  p_connection_id UUID,
  p_action TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection public.recruiter_candidate_connections%ROWTYPE;
  v_is_recipient BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_connection_id IS NULL THEN
    RAISE EXCEPTION 'Connection id is required';
  END IF;

  IF p_action NOT IN ('accept', 'reject') THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;

  SELECT *
  INTO v_connection
  FROM public.recruiter_candidate_connections
  WHERE id = p_connection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection not found';
  END IF;

  IF v_connection.status <> 'pending' THEN
    RAISE EXCEPTION 'Connection is not pending';
  END IF;

  v_is_recipient := (
    (
      v_connection.initiated_by = 'candidate'
      AND EXISTS (
        SELECT 1
        FROM public.recruiters r
        WHERE r.id = v_connection.recruiter_id
          AND r.user_id = auth.uid()
      )
    )
    OR (
      v_connection.initiated_by = 'recruiter'
      AND EXISTS (
        SELECT 1
        FROM public.candidates c
        WHERE c.id = v_connection.candidate_id
          AND c.user_id = auth.uid()
      )
    )
  );

  IF NOT v_is_recipient THEN
    RAISE EXCEPTION 'Not authorized to respond to this request';
  END IF;

  IF p_action = 'reject' THEN
    DELETE FROM public.recruiter_candidate_connections
    WHERE id = p_connection_id;

    RETURN jsonb_build_object(
      'id', p_connection_id,
      'status', 'rejected',
      'action', 'reject'
    );
  END IF;

  UPDATE public.recruiter_candidate_connections
  SET status = 'connected'
  WHERE id = p_connection_id
  RETURNING id, status
  INTO v_connection.id, v_connection.status;

  RETURN jsonb_build_object(
    'id', v_connection.id,
    'status', v_connection.status,
    'action', 'accept'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_connection_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_to_connection_request(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_candidate_connections(
  p_tab TEXT DEFAULT 'received',
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
      CASE
        WHEN p_tab IN ('received', 'sent', 'connected') THEN p_tab
        ELSE 'received'
      END AS tab,
      GREATEST(COALESCE(p_offset, 0), 0) AS row_offset,
      LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50) AS page_limit
  ),
  viewer AS (
    SELECT c.id AS candidate_id
    FROM public.candidates c
    WHERE c.user_id = auth.uid()
  ),
  filtered AS (
    SELECT
      rcc.id,
      rcc.status,
      rcc.initiated_by,
      rcc.message,
      rcc.requested_at,
      rcc.connected_at,
      r.id AS recruiter_id,
      concat_ws(' ', u.first_name, u.last_name) AS name,
      COALESCE(NULLIF(btrim(r.job_title), ''), 'Recruiter') AS title,
      COALESCE(
        NULLIF(btrim(co.name), ''),
        'Independent'
      ) AS company,
      COALESCE(
        NULLIF(
          concat_ws(
            ', ',
            NULLIF(btrim(u.city), ''),
            NULLIF(btrim(u.country), '')
          ),
          ''
        ),
        'Location not listed'
      ) AS location,
      r.profile_picture_url
    FROM public.recruiter_candidate_connections rcc
    INNER JOIN viewer v ON v.candidate_id = rcc.candidate_id
    INNER JOIN public.recruiters r ON r.id = rcc.recruiter_id
    INNER JOIN public.users u ON u.id = r.user_id
    LEFT JOIN public.companies co ON co.id = r.company_id
    CROSS JOIN params p
    WHERE (
      (p.tab = 'received' AND rcc.status = 'pending' AND rcc.initiated_by = 'recruiter')
      OR (p.tab = 'sent' AND rcc.status = 'pending' AND rcc.initiated_by = 'candidate')
      OR (p.tab = 'connected' AND rcc.status = 'connected')
    )
  ),
  total AS (
    SELECT COUNT(*)::INT AS total_count
    FROM filtered
  ),
  paged AS (
    SELECT *
    FROM filtered
    ORDER BY
      CASE WHEN status = 'connected' THEN connected_at END DESC NULLS LAST,
      requested_at DESC
    OFFSET (SELECT row_offset FROM params)
    LIMIT (SELECT page_limit FROM params)
  )
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object(
      'total_count', 0,
      'connections', '[]'::jsonb
    )
    WHEN NOT EXISTS (SELECT 1 FROM viewer) THEN jsonb_build_object(
      'total_count', 0,
      'connections', '[]'::jsonb
    )
    ELSE jsonb_build_object(
      'total_count', (SELECT total_count FROM total),
      'connections', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'status', p.status,
              'initiated_by', p.initiated_by,
              'message', p.message,
              'requested_at', p.requested_at,
              'connected_at', p.connected_at,
              'recruiter_id', p.recruiter_id,
              'name', p.name,
              'title', p.title,
              'company', p.company,
              'location', p.location,
              'profile_picture_url', p.profile_picture_url
            )
            ORDER BY
              CASE WHEN p.status = 'connected' THEN p.connected_at END DESC NULLS LAST,
              p.requested_at DESC
          )
          FROM paged p
        ),
        '[]'::jsonb
      )
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.list_candidate_connections(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_candidate_connections(TEXT, INT, INT) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_recruiter_connections(
  p_tab TEXT DEFAULT 'received',
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
      CASE
        WHEN p_tab IN ('received', 'sent', 'connected') THEN p_tab
        ELSE 'received'
      END AS tab,
      GREATEST(COALESCE(p_offset, 0), 0) AS row_offset,
      LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50) AS page_limit
  ),
  viewer AS (
    SELECT r.id AS recruiter_id
    FROM public.recruiters r
    WHERE r.user_id = auth.uid()
  ),
  filtered AS (
    SELECT
      rcc.id,
      rcc.status,
      rcc.initiated_by,
      rcc.message,
      rcc.requested_at,
      rcc.connected_at,
      c.id AS candidate_id,
      c.vodora_id,
      concat_ws(' ', u.first_name, u.last_name) AS name,
      COALESCE(
        NULLIF(btrim(c.headline), ''),
        NULLIF(btrim(c.current_position), ''),
        NULLIF(btrim(c.profession), ''),
        'Candidate'
      ) AS title,
      NULLIF(btrim(c.current_company_name), '') AS company,
      COALESCE(
        NULLIF(
          concat_ws(
            ', ',
            NULLIF(btrim(c.city), ''),
            NULLIF(btrim(c.country), '')
          ),
          ''
        ),
        NULLIF(
          concat_ws(
            ', ',
            NULLIF(btrim(u.city), ''),
            NULLIF(btrim(u.country), '')
          ),
          ''
        ),
        'Location not listed'
      ) AS location,
      c.profile_picture_url
    FROM public.recruiter_candidate_connections rcc
    INNER JOIN viewer v ON v.recruiter_id = rcc.recruiter_id
    INNER JOIN public.candidates c ON c.id = rcc.candidate_id
    INNER JOIN public.users u ON u.id = c.user_id
    CROSS JOIN params p
    WHERE (
      (p.tab = 'received' AND rcc.status = 'pending' AND rcc.initiated_by = 'candidate')
      OR (p.tab = 'sent' AND rcc.status = 'pending' AND rcc.initiated_by = 'recruiter')
      OR (p.tab = 'connected' AND rcc.status = 'connected')
    )
  ),
  total AS (
    SELECT COUNT(*)::INT AS total_count
    FROM filtered
  ),
  paged AS (
    SELECT *
    FROM filtered
    ORDER BY
      CASE WHEN status = 'connected' THEN connected_at END DESC NULLS LAST,
      requested_at DESC
    OFFSET (SELECT row_offset FROM params)
    LIMIT (SELECT page_limit FROM params)
  )
  SELECT CASE
    WHEN auth.uid() IS NULL THEN jsonb_build_object(
      'total_count', 0,
      'connections', '[]'::jsonb
    )
    WHEN NOT EXISTS (SELECT 1 FROM viewer) THEN jsonb_build_object(
      'total_count', 0,
      'connections', '[]'::jsonb
    )
    ELSE jsonb_build_object(
      'total_count', (SELECT total_count FROM total),
      'connections', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'status', p.status,
              'initiated_by', p.initiated_by,
              'message', p.message,
              'requested_at', p.requested_at,
              'connected_at', p.connected_at,
              'candidate_id', p.candidate_id,
              'vodora_id', p.vodora_id,
              'name', p.name,
              'title', p.title,
              'company', p.company,
              'location', p.location,
              'profile_picture_url', p.profile_picture_url
            )
            ORDER BY
              CASE WHEN p.status = 'connected' THEN p.connected_at END DESC NULLS LAST,
              p.requested_at DESC
          )
          FROM paged p
        ),
        '[]'::jsonb
      )
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.list_recruiter_connections(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_recruiter_connections(TEXT, INT, INT) TO authenticated;
