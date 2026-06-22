-- Extend connections to support candidate ↔ candidate in addition to recruiter ↔ candidate.
-- Existing data may be dropped; table is recreated with a connection_type discriminator.

DROP FUNCTION IF EXISTS public.list_recruiter_connections(TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.list_candidate_connections(TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.respond_to_connection_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_recruiter_candidate_connection_status(UUID);
DROP FUNCTION IF EXISTS public.send_recruiter_connection_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.send_candidate_connection_request(UUID, TEXT);

DROP TABLE IF EXISTS public.recruiter_candidate_connections CASCADE;

CREATE TABLE public.recruiter_candidate_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_type TEXT NOT NULL DEFAULT 'recruiter_candidate',
  recruiter_id UUID REFERENCES public.recruiters (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  peer_candidate_id UUID REFERENCES public.candidates (id) ON DELETE CASCADE,
  initiator_candidate_id UUID REFERENCES public.candidates (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  initiated_by VARCHAR(20) NOT NULL,
  message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recruiter_candidate_connections_type_fields_check CHECK (
    (
      connection_type = 'recruiter_candidate'
      AND recruiter_id IS NOT NULL
      AND peer_candidate_id IS NULL
      AND initiator_candidate_id IS NULL
      AND initiated_by IN ('candidate', 'recruiter')
    )
    OR (
      connection_type = 'candidate_candidate'
      AND recruiter_id IS NULL
      AND peer_candidate_id IS NOT NULL
      AND initiator_candidate_id IS NOT NULL
      AND initiated_by = 'candidate'
      AND candidate_id < peer_candidate_id
      AND initiator_candidate_id IN (candidate_id, peer_candidate_id)
    )
  ),
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

CREATE UNIQUE INDEX recruiter_candidate_connections_recruiter_candidate_unique
  ON public.recruiter_candidate_connections (recruiter_id, candidate_id)
  WHERE connection_type = 'recruiter_candidate';

CREATE UNIQUE INDEX recruiter_candidate_connections_candidate_pair_unique
  ON public.recruiter_candidate_connections (candidate_id, peer_candidate_id)
  WHERE connection_type = 'candidate_candidate';

CREATE INDEX recruiter_candidate_connections_recruiter_id_status_idx
  ON public.recruiter_candidate_connections (recruiter_id, status)
  WHERE connection_type = 'recruiter_candidate';

CREATE INDEX recruiter_candidate_connections_candidate_id_status_idx
  ON public.recruiter_candidate_connections (candidate_id, status);

CREATE INDEX recruiter_candidate_connections_peer_candidate_id_status_idx
  ON public.recruiter_candidate_connections (peer_candidate_id, status)
  WHERE connection_type = 'candidate_candidate';

CREATE INDEX recruiter_candidate_connections_recruiter_pending_idx
  ON public.recruiter_candidate_connections (recruiter_id, requested_at DESC)
  WHERE connection_type = 'recruiter_candidate' AND status = 'pending';

CREATE INDEX recruiter_candidate_connections_candidate_pending_idx
  ON public.recruiter_candidate_connections (candidate_id, requested_at DESC)
  WHERE status = 'pending';

CREATE INDEX recruiter_candidate_connections_peer_pending_idx
  ON public.recruiter_candidate_connections (peer_candidate_id, requested_at DESC)
  WHERE connection_type = 'candidate_candidate' AND status = 'pending';

CREATE INDEX recruiter_candidate_connections_recruiter_connected_idx
  ON public.recruiter_candidate_connections (recruiter_id)
  WHERE connection_type = 'recruiter_candidate' AND status = 'connected';

CREATE INDEX recruiter_candidate_connections_candidate_connected_idx
  ON public.recruiter_candidate_connections (candidate_id)
  WHERE status = 'connected';

CREATE INDEX recruiter_candidate_connections_peer_connected_idx
  ON public.recruiter_candidate_connections (peer_candidate_id)
  WHERE connection_type = 'candidate_candidate' AND status = 'connected';

CREATE TRIGGER recruiter_candidate_connections_set_updated_at
  BEFORE UPDATE ON public.recruiter_candidate_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

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
      WHERE c.user_id = auth.uid()
        AND (
          c.id = recruiter_candidate_connections.candidate_id
          OR c.id = recruiter_candidate_connections.peer_candidate_id
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = recruiter_candidate_connections.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY recruiter_candidate_connections_insert_candidate_recruiter
  ON public.recruiter_candidate_connections
  FOR INSERT TO authenticated
  WITH CHECK (
    connection_type = 'recruiter_candidate'
    AND initiated_by = 'candidate'
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
    connection_type = 'recruiter_candidate'
    AND initiated_by = 'recruiter'
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

CREATE POLICY recruiter_candidate_connections_insert_candidate_peer
  ON public.recruiter_candidate_connections
  FOR INSERT TO authenticated
  WITH CHECK (
    connection_type = 'candidate_candidate'
    AND initiated_by = 'candidate'
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE c.id = recruiter_candidate_connections.initiator_candidate_id
        AND c.user_id = auth.uid()
        AND u.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      INNER JOIN public.users u ON u.id = c.user_id
      WHERE c.id IN (
        recruiter_candidate_connections.candidate_id,
        recruiter_candidate_connections.peer_candidate_id
      )
      AND c.id <> recruiter_candidate_connections.initiator_candidate_id
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
    connection_type,
    recruiter_id,
    candidate_id,
    status,
    initiated_by,
    message
  )
  VALUES (
    'recruiter_candidate',
    p_recruiter_id,
    v_candidate_id,
    'pending',
    'candidate',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT rcc.id, rcc.status
    INTO v_connection_id, v_status
    FROM public.recruiter_candidate_connections rcc
    WHERE rcc.connection_type = 'recruiter_candidate'
      AND rcc.recruiter_id = p_recruiter_id
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

CREATE OR REPLACE FUNCTION public.send_candidate_peer_connection_request(
  p_peer_candidate_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_id UUID;
  v_lower_id UUID;
  v_higher_id UUID;
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

  IF p_peer_candidate_id IS NULL THEN
    RAISE EXCEPTION 'Candidate id is required';
  END IF;

  IF p_peer_candidate_id = v_candidate_id THEN
    RAISE EXCEPTION 'Cannot connect to yourself';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.candidates c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.id = p_peer_candidate_id
      AND c.visibility IN ('recruiters_only', 'public')
      AND u.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Candidate not found';
  END IF;

  v_lower_id := LEAST(v_candidate_id, p_peer_candidate_id);
  v_higher_id := GREATEST(v_candidate_id, p_peer_candidate_id);

  INSERT INTO public.recruiter_candidate_connections (
    connection_type,
    candidate_id,
    peer_candidate_id,
    initiator_candidate_id,
    status,
    initiated_by,
    message
  )
  VALUES (
    'candidate_candidate',
    v_lower_id,
    v_higher_id,
    v_candidate_id,
    'pending',
    'candidate',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT rcc.id, rcc.status
    INTO v_connection_id, v_status
    FROM public.recruiter_candidate_connections rcc
    WHERE rcc.connection_type = 'candidate_candidate'
      AND rcc.candidate_id = v_lower_id
      AND rcc.peer_candidate_id = v_higher_id;

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

REVOKE ALL ON FUNCTION public.send_candidate_peer_connection_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_candidate_peer_connection_request(UUID, TEXT) TO authenticated;

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
    connection_type,
    recruiter_id,
    candidate_id,
    status,
    initiated_by,
    message
  )
  VALUES (
    'recruiter_candidate',
    v_recruiter_id,
    p_candidate_id,
    'pending',
    'recruiter',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT rcc.id, rcc.status
    INTO v_connection_id, v_status
    FROM public.recruiter_candidate_connections rcc
    WHERE rcc.connection_type = 'recruiter_candidate'
      AND rcc.recruiter_id = v_recruiter_id
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
            WHERE rcc.status = 'pending'
              AND (
                (
                  rcc.connection_type = 'recruiter_candidate'
                  AND rcc.initiated_by = 'recruiter'
                )
                OR (
                  rcc.connection_type = 'candidate_candidate'
                  AND rcc.initiator_candidate_id <> c.id
                )
              )
          )::INT,
          'pending_sent', COUNT(*) FILTER (
            WHERE rcc.status = 'pending'
              AND (
                (
                  rcc.connection_type = 'recruiter_candidate'
                  AND rcc.initiated_by = 'candidate'
                )
                OR (
                  rcc.connection_type = 'candidate_candidate'
                  AND rcc.initiator_candidate_id = c.id
                )
              )
          )::INT,
          'connected', COUNT(*) FILTER (WHERE rcc.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.recruiter_candidate_connections rcc
        INNER JOIN public.candidates c ON c.user_id = auth.uid()
        WHERE (
          (
            rcc.connection_type = 'recruiter_candidate'
            AND rcc.candidate_id = c.id
          )
          OR (
            rcc.connection_type = 'candidate_candidate'
            AND (
              rcc.candidate_id = c.id
              OR rcc.peer_candidate_id = c.id
            )
          )
        )
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
          AND rcc.connection_type = 'recruiter_candidate'
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
        'initiated_by', rcc.initiated_by,
        'connection_type', rcc.connection_type
      )
      FROM public.recruiter_candidate_connections rcc
      INNER JOIN public.recruiters r ON r.id = rcc.recruiter_id
      WHERE r.user_id = auth.uid()
        AND rcc.connection_type = 'recruiter_candidate'
        AND rcc.candidate_id = p_candidate_id
      LIMIT 1
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_candidate_connection_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_candidate_connection_status(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_candidate_peer_connection_status(
  p_peer_candidate_id UUID
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    WHEN p_peer_candidate_id IS NULL THEN NULL
    ELSE (
      SELECT jsonb_build_object(
        'id', rcc.id,
        'status', rcc.status,
        'initiated_by', rcc.initiated_by,
        'connection_type', rcc.connection_type
      )
      FROM public.recruiter_candidate_connections rcc
      INNER JOIN public.candidates viewer ON viewer.user_id = auth.uid()
      WHERE rcc.connection_type = 'candidate_candidate'
        AND (
          (
            rcc.candidate_id = viewer.id
            AND rcc.peer_candidate_id = p_peer_candidate_id
          )
          OR (
            rcc.peer_candidate_id = viewer.id
            AND rcc.candidate_id = p_peer_candidate_id
          )
        )
      LIMIT 1
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_candidate_peer_connection_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_peer_connection_status(UUID) TO authenticated;

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
      v_connection.connection_type = 'recruiter_candidate'
      AND v_connection.initiated_by = 'candidate'
      AND EXISTS (
        SELECT 1
        FROM public.recruiters r
        WHERE r.id = v_connection.recruiter_id
          AND r.user_id = auth.uid()
      )
    )
    OR (
      v_connection.connection_type = 'recruiter_candidate'
      AND v_connection.initiated_by = 'recruiter'
      AND EXISTS (
        SELECT 1
        FROM public.candidates c
        WHERE c.id = v_connection.candidate_id
          AND c.user_id = auth.uid()
      )
    )
    OR (
      v_connection.connection_type = 'candidate_candidate'
      AND EXISTS (
        SELECT 1
        FROM public.candidates c
        WHERE c.user_id = auth.uid()
          AND c.id IN (v_connection.candidate_id, v_connection.peer_candidate_id)
          AND c.id <> v_connection.initiator_candidate_id
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
  recruiter_rows AS (
    SELECT
      rcc.id,
      rcc.status,
      rcc.initiated_by,
      rcc.message,
      rcc.requested_at,
      rcc.connected_at,
      rcc.connection_type,
      r.id AS recruiter_id,
      NULL::UUID AS peer_candidate_id,
      NULL::TEXT AS vodora_id,
      concat_ws(' ', u.first_name, u.last_name) AS name,
      COALESCE(NULLIF(btrim(r.job_title), ''), 'Recruiter') AS title,
      COALESCE(NULLIF(btrim(co.name), ''), 'Independent') AS company,
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
    WHERE rcc.connection_type = 'recruiter_candidate'
  ),
  peer_rows AS (
    SELECT
      rcc.id,
      rcc.status,
      rcc.initiated_by,
      rcc.message,
      rcc.requested_at,
      rcc.connected_at,
      rcc.connection_type,
      NULL::UUID AS recruiter_id,
      CASE
        WHEN rcc.candidate_id = v.candidate_id THEN rcc.peer_candidate_id
        ELSE rcc.candidate_id
      END AS peer_candidate_id,
      peer.vodora_id,
      concat_ws(' ', peer_u.first_name, peer_u.last_name) AS name,
      COALESCE(
        NULLIF(btrim(peer.headline), ''),
        NULLIF(btrim(peer.current_position), ''),
        NULLIF(btrim(peer.profession), ''),
        'Candidate'
      ) AS title,
      COALESCE(NULLIF(btrim(peer.current_company_name), ''), '') AS company,
      COALESCE(
        NULLIF(
          concat_ws(
            ', ',
            NULLIF(btrim(peer.city), ''),
            NULLIF(btrim(peer.country), '')
          ),
          ''
        ),
        NULLIF(
          concat_ws(
            ', ',
            NULLIF(btrim(peer_u.city), ''),
            NULLIF(btrim(peer_u.country), '')
          ),
          ''
        ),
        'Location not listed'
      ) AS location,
      peer.profile_picture_url,
      rcc.initiator_candidate_id
    FROM public.recruiter_candidate_connections rcc
    INNER JOIN viewer v
      ON v.candidate_id IN (rcc.candidate_id, rcc.peer_candidate_id)
    INNER JOIN public.candidates peer
      ON peer.id = CASE
        WHEN rcc.candidate_id = v.candidate_id THEN rcc.peer_candidate_id
        ELSE rcc.candidate_id
      END
    INNER JOIN public.users peer_u ON peer_u.id = peer.user_id
    WHERE rcc.connection_type = 'candidate_candidate'
  ),
  combined AS (
    SELECT
      rr.id,
      rr.status,
      rr.initiated_by,
      rr.message,
      rr.requested_at,
      rr.connected_at,
      rr.connection_type,
      rr.recruiter_id,
      rr.peer_candidate_id,
      rr.vodora_id,
      rr.name,
      rr.title,
      rr.company,
      rr.location,
      rr.profile_picture_url,
      NULL::UUID AS initiator_candidate_id
    FROM recruiter_rows rr
    UNION ALL
    SELECT
      pr.id,
      pr.status,
      pr.initiated_by,
      pr.message,
      pr.requested_at,
      pr.connected_at,
      pr.connection_type,
      pr.recruiter_id,
      pr.peer_candidate_id,
      pr.vodora_id,
      pr.name,
      pr.title,
      pr.company,
      pr.location,
      pr.profile_picture_url,
      pr.initiator_candidate_id
    FROM peer_rows pr
  ),
  filtered AS (
    SELECT c.*
    FROM combined c
    CROSS JOIN params p
    CROSS JOIN viewer v
    WHERE (
      (
        p.tab = 'received'
        AND c.status = 'pending'
        AND (
          (
            c.connection_type = 'recruiter_candidate'
            AND c.initiated_by = 'recruiter'
          )
          OR (
            c.connection_type = 'candidate_candidate'
            AND c.initiator_candidate_id <> v.candidate_id
          )
        )
      )
      OR (
        p.tab = 'sent'
        AND c.status = 'pending'
        AND (
          (
            c.connection_type = 'recruiter_candidate'
            AND c.initiated_by = 'candidate'
          )
          OR (
            c.connection_type = 'candidate_candidate'
            AND c.initiator_candidate_id = v.candidate_id
          )
        )
      )
      OR (p.tab = 'connected' AND c.status = 'connected')
    )
  ),
  total AS (
    SELECT COUNT(*)::INT AS total_count
    FROM filtered
  ),
  paged AS (
    SELECT
      id,
      status,
      initiated_by,
      message,
      requested_at,
      connected_at,
      connection_type,
      recruiter_id,
      peer_candidate_id,
      vodora_id,
      name,
      title,
      company,
      location,
      profile_picture_url
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
              'connection_type', p.connection_type,
              'recruiter_id', p.recruiter_id,
              'peer_candidate_id', p.peer_candidate_id,
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
    WHERE rcc.connection_type = 'recruiter_candidate'
      AND (
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
