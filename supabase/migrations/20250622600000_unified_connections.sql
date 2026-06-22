-- Unified connections table for all participant pair types:
-- candidate ↔ candidate, candidate ↔ recruiter, recruiter ↔ recruiter.
-- Replaces recruiter_candidate_connections with a scalable canonical-pair model.

DROP FUNCTION IF EXISTS public.list_recruiter_connections(TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.list_candidate_connections(TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.respond_to_connection_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_candidate_peer_connection_status(UUID);
DROP FUNCTION IF EXISTS public.get_recruiter_candidate_connection_status(UUID);
DROP FUNCTION IF EXISTS public.send_candidate_peer_connection_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.send_recruiter_connection_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.send_candidate_connection_request(UUID, TEXT);

DROP TABLE IF EXISTS public.recruiter_candidate_connections CASCADE;

CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_type TEXT NOT NULL,
  participant_1_candidate_id UUID REFERENCES public.candidates (id) ON DELETE CASCADE,
  participant_1_recruiter_id UUID REFERENCES public.recruiters (id) ON DELETE CASCADE,
  participant_2_type TEXT NOT NULL,
  participant_2_candidate_id UUID REFERENCES public.candidates (id) ON DELETE CASCADE,
  participant_2_recruiter_id UUID REFERENCES public.recruiters (id) ON DELETE CASCADE,
  initiator_type TEXT NOT NULL,
  initiator_candidate_id UUID REFERENCES public.candidates (id) ON DELETE CASCADE,
  initiator_recruiter_id UUID REFERENCES public.recruiters (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT connections_participant_1_type_check CHECK (
    participant_1_type IN ('candidate', 'recruiter')
  ),
  CONSTRAINT connections_participant_2_type_check CHECK (
    participant_2_type IN ('candidate', 'recruiter')
  ),
  CONSTRAINT connections_initiator_type_check CHECK (
    initiator_type IN ('candidate', 'recruiter')
  ),
  CONSTRAINT connections_participant_1_member_check CHECK (
    (
      participant_1_type = 'candidate'
      AND participant_1_candidate_id IS NOT NULL
      AND participant_1_recruiter_id IS NULL
    )
    OR (
      participant_1_type = 'recruiter'
      AND participant_1_recruiter_id IS NOT NULL
      AND participant_1_candidate_id IS NULL
    )
  ),
  CONSTRAINT connections_participant_2_member_check CHECK (
    (
      participant_2_type = 'candidate'
      AND participant_2_candidate_id IS NOT NULL
      AND participant_2_recruiter_id IS NULL
    )
    OR (
      participant_2_type = 'recruiter'
      AND participant_2_recruiter_id IS NOT NULL
      AND participant_2_candidate_id IS NULL
    )
  ),
  CONSTRAINT connections_initiator_member_check CHECK (
    (
      initiator_type = 'candidate'
      AND initiator_candidate_id IS NOT NULL
      AND initiator_recruiter_id IS NULL
    )
    OR (
      initiator_type = 'recruiter'
      AND initiator_recruiter_id IS NOT NULL
      AND initiator_candidate_id IS NULL
    )
  ),
  CONSTRAINT connections_pair_check CHECK (
    (
      participant_1_type = 'candidate'
      AND participant_2_type = 'candidate'
      AND participant_1_candidate_id < participant_2_candidate_id
    )
    OR (
      participant_1_type = 'candidate'
      AND participant_2_type = 'recruiter'
    )
    OR (
      participant_1_type = 'recruiter'
      AND participant_2_type = 'recruiter'
      AND participant_1_recruiter_id < participant_2_recruiter_id
    )
  ),
  CONSTRAINT connections_initiator_is_participant_check CHECK (
    (
      initiator_type = 'candidate'
      AND initiator_candidate_id IN (
        participant_1_candidate_id,
        participant_2_candidate_id
      )
    )
    OR (
      initiator_type = 'recruiter'
      AND initiator_recruiter_id IN (
        participant_1_recruiter_id,
        participant_2_recruiter_id
      )
    )
  ),
  CONSTRAINT connections_status_check CHECK (
    status IN ('pending', 'connected')
  ),
  CONSTRAINT connections_message_length_check CHECK (
    message IS NULL OR char_length(message) <= 2000
  )
);

CREATE UNIQUE INDEX connections_candidate_recruiter_unique
  ON public.connections (participant_1_candidate_id, participant_2_recruiter_id)
  WHERE participant_1_type = 'candidate' AND participant_2_type = 'recruiter';

CREATE UNIQUE INDEX connections_candidate_pair_unique
  ON public.connections (participant_1_candidate_id, participant_2_candidate_id)
  WHERE participant_1_type = 'candidate' AND participant_2_type = 'candidate';

CREATE UNIQUE INDEX connections_recruiter_pair_unique
  ON public.connections (participant_1_recruiter_id, participant_2_recruiter_id)
  WHERE participant_1_type = 'recruiter' AND participant_2_type = 'recruiter';

CREATE INDEX connections_participant_1_candidate_status_idx
  ON public.connections (participant_1_candidate_id, status)
  WHERE participant_1_candidate_id IS NOT NULL;

CREATE INDEX connections_participant_2_candidate_status_idx
  ON public.connections (participant_2_candidate_id, status)
  WHERE participant_2_candidate_id IS NOT NULL;

CREATE INDEX connections_participant_1_recruiter_status_idx
  ON public.connections (participant_1_recruiter_id, status)
  WHERE participant_1_recruiter_id IS NOT NULL;

CREATE INDEX connections_participant_2_recruiter_status_idx
  ON public.connections (participant_2_recruiter_id, status)
  WHERE participant_2_recruiter_id IS NOT NULL;

CREATE INDEX connections_pending_requested_at_idx
  ON public.connections (requested_at DESC)
  WHERE status = 'pending';

CREATE INDEX connections_connected_at_idx
  ON public.connections (connected_at DESC)
  WHERE status = 'connected';

CREATE TRIGGER connections_set_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER connections_set_connected_at
  BEFORE UPDATE OF status ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_connection_connected_at();

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY connections_select_participant
  ON public.connections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.user_id = auth.uid()
        AND c.id IN (
          connections.participant_1_candidate_id,
          connections.participant_2_candidate_id
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.user_id = auth.uid()
        AND r.id IN (
          connections.participant_1_recruiter_id,
          connections.participant_2_recruiter_id
        )
    )
  );

CREATE OR REPLACE FUNCTION public.connection_kind(
  p_participant_1_type TEXT,
  p_participant_2_type TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_participant_1_type = 'candidate' AND p_participant_2_type = 'candidate'
      THEN 'candidate_candidate'
    WHEN p_participant_1_type = 'candidate' AND p_participant_2_type = 'recruiter'
      THEN 'candidate_recruiter'
  ELSE 'recruiter_recruiter'
  END;
$$;

CREATE OR REPLACE FUNCTION public.viewer_is_connection_initiator(p_connection public.connections)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (
      p_connection.initiator_type = 'candidate'
      AND EXISTS (
        SELECT 1
        FROM public.candidates c
        WHERE c.user_id = auth.uid()
          AND c.id = p_connection.initiator_candidate_id
      )
    )
    OR (
      p_connection.initiator_type = 'recruiter'
      AND EXISTS (
        SELECT 1
        FROM public.recruiters r
        WHERE r.user_id = auth.uid()
          AND r.id = p_connection.initiator_recruiter_id
      )
    );
$$;

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

  INSERT INTO public.connections (
    participant_1_type,
    participant_1_candidate_id,
    participant_2_type,
    participant_2_recruiter_id,
    initiator_type,
    initiator_candidate_id,
    status,
    message
  )
  VALUES (
    'candidate',
    v_candidate_id,
    'recruiter',
    p_recruiter_id,
    'candidate',
    v_candidate_id,
    'pending',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT conn.id, conn.status
    INTO v_connection_id, v_status
    FROM public.connections conn
    WHERE conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'recruiter'
      AND conn.participant_1_candidate_id = v_candidate_id
      AND conn.participant_2_recruiter_id = p_recruiter_id;

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

  INSERT INTO public.connections (
    participant_1_type,
    participant_1_candidate_id,
    participant_2_type,
    participant_2_recruiter_id,
    initiator_type,
    initiator_recruiter_id,
    status,
    message
  )
  VALUES (
    'candidate',
    p_candidate_id,
    'recruiter',
    v_recruiter_id,
    'recruiter',
    v_recruiter_id,
    'pending',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT conn.id, conn.status
    INTO v_connection_id, v_status
    FROM public.connections conn
    WHERE conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'recruiter'
      AND conn.participant_1_candidate_id = p_candidate_id
      AND conn.participant_2_recruiter_id = v_recruiter_id;

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

  INSERT INTO public.connections (
    participant_1_type,
    participant_1_candidate_id,
    participant_2_type,
    participant_2_candidate_id,
    initiator_type,
    initiator_candidate_id,
    status,
    message
  )
  VALUES (
    'candidate',
    v_lower_id,
    'candidate',
    v_higher_id,
    'candidate',
    v_candidate_id,
    'pending',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT conn.id, conn.status
    INTO v_connection_id, v_status
    FROM public.connections conn
    WHERE conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'candidate'
      AND conn.participant_1_candidate_id = v_lower_id
      AND conn.participant_2_candidate_id = v_higher_id;

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

CREATE OR REPLACE FUNCTION public.send_recruiter_peer_connection_request(
  p_peer_recruiter_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id UUID;
  v_lower_id UUID;
  v_higher_id UUID;
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

  IF p_peer_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'Recruiter id is required';
  END IF;

  IF p_peer_recruiter_id = v_recruiter_id THEN
    RAISE EXCEPTION 'Cannot connect to yourself';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    INNER JOIN public.users u ON u.id = r.user_id
    WHERE r.id = p_peer_recruiter_id
      AND u.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Recruiter not found';
  END IF;

  v_lower_id := LEAST(v_recruiter_id, p_peer_recruiter_id);
  v_higher_id := GREATEST(v_recruiter_id, p_peer_recruiter_id);

  INSERT INTO public.connections (
    participant_1_type,
    participant_1_recruiter_id,
    participant_2_type,
    participant_2_recruiter_id,
    initiator_type,
    initiator_recruiter_id,
    status,
    message
  )
  VALUES (
    'recruiter',
    v_lower_id,
    'recruiter',
    v_higher_id,
    'recruiter',
    v_recruiter_id,
    'pending',
    NULLIF(btrim(p_message), '')
  )
  ON CONFLICT DO NOTHING
  RETURNING id, status
  INTO v_connection_id, v_status;

  IF v_connection_id IS NULL THEN
    SELECT conn.id, conn.status
    INTO v_connection_id, v_status
    FROM public.connections conn
    WHERE conn.participant_1_type = 'recruiter'
      AND conn.participant_2_type = 'recruiter'
      AND conn.participant_1_recruiter_id = v_lower_id
      AND conn.participant_2_recruiter_id = v_higher_id;

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

REVOKE ALL ON FUNCTION public.send_recruiter_peer_connection_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_recruiter_peer_connection_request(UUID, TEXT) TO authenticated;

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
          'pending', COUNT(*) FILTER (WHERE conn.status = 'pending')::INT,
          'pending_received', COUNT(*) FILTER (
            WHERE conn.status = 'pending'
              AND NOT public.viewer_is_connection_initiator(conn)
          )::INT,
          'pending_sent', COUNT(*) FILTER (
            WHERE conn.status = 'pending'
              AND public.viewer_is_connection_initiator(conn)
          )::INT,
          'connected', COUNT(*) FILTER (WHERE conn.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.connections conn
        INNER JOIN public.candidates c ON c.user_id = auth.uid()
        WHERE c.id IN (
          conn.participant_1_candidate_id,
          conn.participant_2_candidate_id
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
          'pending', COUNT(*) FILTER (WHERE conn.status = 'pending')::INT,
          'pending_received', COUNT(*) FILTER (
            WHERE conn.status = 'pending'
              AND NOT public.viewer_is_connection_initiator(conn)
          )::INT,
          'pending_sent', COUNT(*) FILTER (
            WHERE conn.status = 'pending'
              AND public.viewer_is_connection_initiator(conn)
          )::INT,
          'connected', COUNT(*) FILTER (WHERE conn.status = 'connected')::INT,
          'total', COUNT(*)::INT
        )
        FROM public.connections conn
        INNER JOIN public.recruiters r ON r.user_id = auth.uid()
        WHERE r.id IN (
          conn.participant_1_recruiter_id,
          conn.participant_2_recruiter_id
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
        'id', conn.id,
        'status', conn.status,
        'initiated_by', conn.initiator_type,
        'connection_type', public.connection_kind(
          conn.participant_1_type,
          conn.participant_2_type
        )
      )
      FROM public.connections conn
      INNER JOIN public.recruiters r ON r.user_id = auth.uid()
      WHERE conn.participant_1_type = 'candidate'
        AND conn.participant_2_type = 'recruiter'
        AND conn.participant_1_candidate_id = p_candidate_id
        AND conn.participant_2_recruiter_id = r.id
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
        'id', conn.id,
        'status', conn.status,
        'initiated_by', conn.initiator_type,
        'connection_type', public.connection_kind(
          conn.participant_1_type,
          conn.participant_2_type
        )
      )
      FROM public.connections conn
      INNER JOIN public.candidates viewer ON viewer.user_id = auth.uid()
      WHERE conn.participant_1_type = 'candidate'
        AND conn.participant_2_type = 'candidate'
        AND viewer.id IN (
          conn.participant_1_candidate_id,
          conn.participant_2_candidate_id
        )
        AND p_peer_candidate_id IN (
          conn.participant_1_candidate_id,
          conn.participant_2_candidate_id
        )
      LIMIT 1
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_candidate_peer_connection_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_peer_connection_status(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_recruiter_peer_connection_status(
  p_peer_recruiter_id UUID
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    WHEN p_peer_recruiter_id IS NULL THEN NULL
    ELSE (
      SELECT jsonb_build_object(
        'id', conn.id,
        'status', conn.status,
        'initiated_by', conn.initiator_type,
        'connection_type', public.connection_kind(
          conn.participant_1_type,
          conn.participant_2_type
        )
      )
      FROM public.connections conn
      INNER JOIN public.recruiters viewer ON viewer.user_id = auth.uid()
      WHERE conn.participant_1_type = 'recruiter'
        AND conn.participant_2_type = 'recruiter'
        AND viewer.id IN (
          conn.participant_1_recruiter_id,
          conn.participant_2_recruiter_id
        )
        AND p_peer_recruiter_id IN (
          conn.participant_1_recruiter_id,
          conn.participant_2_recruiter_id
        )
      LIMIT 1
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_recruiter_peer_connection_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recruiter_peer_connection_status(UUID) TO authenticated;

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
  v_connection public.connections%ROWTYPE;
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
  FROM public.connections
  WHERE id = p_connection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection not found';
  END IF;

  IF v_connection.status <> 'pending' THEN
    RAISE EXCEPTION 'Connection is not pending';
  END IF;

  v_is_recipient := NOT public.viewer_is_connection_initiator(v_connection)
    AND (
      EXISTS (
        SELECT 1
        FROM public.candidates c
        WHERE c.user_id = auth.uid()
          AND c.id IN (
            v_connection.participant_1_candidate_id,
            v_connection.participant_2_candidate_id
          )
      )
      OR EXISTS (
        SELECT 1
        FROM public.recruiters r
        WHERE r.user_id = auth.uid()
          AND r.id IN (
            v_connection.participant_1_recruiter_id,
            v_connection.participant_2_recruiter_id
          )
      )
    );

  IF NOT v_is_recipient THEN
    RAISE EXCEPTION 'Not authorized to respond to this request';
  END IF;

  IF p_action = 'reject' THEN
    DELETE FROM public.connections
    WHERE id = p_connection_id;

    RETURN jsonb_build_object(
      'id', p_connection_id,
      'status', 'rejected',
      'action', 'reject'
    );
  END IF;

  UPDATE public.connections
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
      conn.id,
      conn.status,
      conn.initiator_type AS initiated_by,
      conn.message,
      conn.requested_at,
      conn.connected_at,
      public.connection_kind(conn.participant_1_type, conn.participant_2_type) AS connection_type,
      conn.participant_2_recruiter_id AS recruiter_id,
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
      r.profile_picture_url,
      conn.initiator_candidate_id,
      conn.initiator_recruiter_id
    FROM public.connections conn
    INNER JOIN viewer v ON v.candidate_id = conn.participant_1_candidate_id
    INNER JOIN public.recruiters r ON r.id = conn.participant_2_recruiter_id
    INNER JOIN public.users u ON u.id = r.user_id
    LEFT JOIN public.companies co ON co.id = r.company_id
    WHERE conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'recruiter'
  ),
  peer_rows AS (
    SELECT
      conn.id,
      conn.status,
      conn.initiator_type AS initiated_by,
      conn.message,
      conn.requested_at,
      conn.connected_at,
      public.connection_kind(conn.participant_1_type, conn.participant_2_type) AS connection_type,
      NULL::UUID AS recruiter_id,
      CASE
        WHEN conn.participant_1_candidate_id = v.candidate_id
          THEN conn.participant_2_candidate_id
        ELSE conn.participant_1_candidate_id
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
      conn.initiator_candidate_id,
      conn.initiator_recruiter_id
    FROM public.connections conn
    INNER JOIN viewer v
      ON v.candidate_id IN (
        conn.participant_1_candidate_id,
        conn.participant_2_candidate_id
      )
    INNER JOIN public.candidates peer
      ON peer.id = CASE
        WHEN conn.participant_1_candidate_id = v.candidate_id
          THEN conn.participant_2_candidate_id
        ELSE conn.participant_1_candidate_id
      END
    INNER JOIN public.users peer_u ON peer_u.id = peer.user_id
    WHERE conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'candidate'
  ),
  combined AS (
    SELECT * FROM recruiter_rows
    UNION ALL
    SELECT * FROM peer_rows
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
        AND c.initiator_candidate_id IS DISTINCT FROM v.candidate_id
        AND (
          c.initiated_by = 'recruiter'
          OR c.connection_type = 'candidate_candidate'
        )
      )
      OR (
        p.tab = 'sent'
        AND c.status = 'pending'
        AND c.initiator_candidate_id = v.candidate_id
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
  candidate_rows AS (
    SELECT
      conn.id,
      conn.status,
      conn.initiator_type AS initiated_by,
      conn.message,
      conn.requested_at,
      conn.connected_at,
      public.connection_kind(conn.participant_1_type, conn.participant_2_type) AS connection_type,
      c.id AS candidate_id,
      NULL::UUID AS peer_recruiter_id,
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
      c.profile_picture_url,
      conn.initiator_candidate_id,
      conn.initiator_recruiter_id
    FROM public.connections conn
    INNER JOIN viewer v ON v.recruiter_id = conn.participant_2_recruiter_id
    INNER JOIN public.candidates c ON c.id = conn.participant_1_candidate_id
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE conn.participant_1_type = 'candidate'
      AND conn.participant_2_type = 'recruiter'
  ),
  peer_rows AS (
    SELECT
      conn.id,
      conn.status,
      conn.initiator_type AS initiated_by,
      conn.message,
      conn.requested_at,
      conn.connected_at,
      public.connection_kind(conn.participant_1_type, conn.participant_2_type) AS connection_type,
      NULL::UUID AS candidate_id,
      CASE
        WHEN conn.participant_1_recruiter_id = v.recruiter_id
          THEN conn.participant_2_recruiter_id
        ELSE conn.participant_1_recruiter_id
      END AS peer_recruiter_id,
      NULL::TEXT AS vodora_id,
      concat_ws(' ', peer_u.first_name, peer_u.last_name) AS name,
      COALESCE(NULLIF(btrim(peer.job_title), ''), 'Recruiter') AS title,
      COALESCE(NULLIF(btrim(co.name), ''), 'Independent') AS company,
      COALESCE(
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
      conn.initiator_candidate_id,
      conn.initiator_recruiter_id
    FROM public.connections conn
    INNER JOIN viewer v
      ON v.recruiter_id IN (
        conn.participant_1_recruiter_id,
        conn.participant_2_recruiter_id
      )
    INNER JOIN public.recruiters peer
      ON peer.id = CASE
        WHEN conn.participant_1_recruiter_id = v.recruiter_id
          THEN conn.participant_2_recruiter_id
        ELSE conn.participant_1_recruiter_id
      END
    INNER JOIN public.users peer_u ON peer_u.id = peer.user_id
    LEFT JOIN public.companies co ON co.id = peer.company_id
    WHERE conn.participant_1_type = 'recruiter'
      AND conn.participant_2_type = 'recruiter'
  ),
  combined AS (
    SELECT * FROM candidate_rows
    UNION ALL
    SELECT * FROM peer_rows
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
        AND c.initiator_recruiter_id IS DISTINCT FROM v.recruiter_id
        AND (
          c.initiated_by = 'candidate'
          OR c.connection_type = 'recruiter_recruiter'
        )
      )
      OR (
        p.tab = 'sent'
        AND c.status = 'pending'
        AND c.initiator_recruiter_id = v.recruiter_id
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
      candidate_id,
      peer_recruiter_id,
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
              'candidate_id', p.candidate_id,
              'peer_recruiter_id', p.peer_recruiter_id,
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

-- Keep recruiter directory connection status in sync with unified table.
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
