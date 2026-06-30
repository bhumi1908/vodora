-- Phase 3: create in-app notifications when connections, applications, and references change.
-- Uses try_create_notification so a notification failure never blocks the source action.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_display_name(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(
    btrim(
      concat_ws(
        ' ',
        NULLIF(btrim(u.first_name), ''),
        NULLIF(btrim(u.last_name), '')
      )
    ),
    ''
  )
  FROM public.users u
  WHERE u.id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.connection_participant_user_id(
  p_participant_type TEXT,
  p_candidate_id UUID,
  p_recruiter_id UUID
)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_participant_type = 'candidate' THEN (
      SELECT c.user_id
      FROM public.candidates c
      WHERE c.id = p_candidate_id
    )
    WHEN p_participant_type = 'recruiter' THEN (
      SELECT r.user_id
      FROM public.recruiters r
      WHERE r.id = p_recruiter_id
    )
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.connection_initiator_user_id(p_connection public.connections)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.connection_participant_user_id(
    p_connection.initiator_type,
    p_connection.initiator_candidate_id,
    p_connection.initiator_recruiter_id
  );
$$;

CREATE OR REPLACE FUNCTION public.connection_recipient_participant_type(
  p_connection public.connections
)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN (
      p_connection.initiator_type = p_connection.participant_1_type
      AND (
        (
          p_connection.initiator_type = 'candidate'
          AND p_connection.initiator_candidate_id = p_connection.participant_1_candidate_id
        )
        OR (
          p_connection.initiator_type = 'recruiter'
          AND p_connection.initiator_recruiter_id = p_connection.participant_1_recruiter_id
        )
      )
    ) THEN p_connection.participant_2_type
    ELSE p_connection.participant_1_type
  END;
$$;

CREATE OR REPLACE FUNCTION public.connection_recipient_user_id(p_connection public.connections)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN (
      p_connection.initiator_type = p_connection.participant_1_type
      AND (
        (
          p_connection.initiator_type = 'candidate'
          AND p_connection.initiator_candidate_id = p_connection.participant_1_candidate_id
        )
        OR (
          p_connection.initiator_type = 'recruiter'
          AND p_connection.initiator_recruiter_id = p_connection.participant_1_recruiter_id
        )
      )
    ) THEN public.connection_participant_user_id(
      p_connection.participant_2_type,
      p_connection.participant_2_candidate_id,
      p_connection.participant_2_recruiter_id
    )
    ELSE public.connection_participant_user_id(
      p_connection.participant_1_type,
      p_connection.participant_1_candidate_id,
      p_connection.participant_1_recruiter_id
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.connections_action_url(
  p_participant_type TEXT,
  p_tab TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_participant_type = 'recruiter' THEN '/recruiter/connections?tab=' || p_tab
    ELSE '/connections?tab=' || p_tab
  END;
$$;

CREATE OR REPLACE FUNCTION public.job_application_status_label(p_status TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(btrim(p_status))
    WHEN 'applied' THEN 'Applied'
    WHEN 'shortlisted' THEN 'Shortlisted'
    WHEN 'interview' THEN 'Interview'
    WHEN 'offer' THEN 'Offer'
    WHEN 'unsuccessful' THEN 'Unsuccessful'
    ELSE initcap(replace(lower(btrim(p_status)), '_', ' '))
  END;
$$;

CREATE OR REPLACE FUNCTION public.try_create_notification(
  p_recipient_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_actor_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_recipient_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN public.create_notification(
    p_recipient_user_id,
    p_type,
    p_title,
    p_body,
    p_action_url,
    p_entity_type,
    p_entity_id,
    p_actor_user_id,
    p_metadata
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.try_create_notification(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  UUID,
  UUID,
  JSONB
) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Connections
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_connection_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient_user_id UUID;
  v_initiator_user_id UUID;
  v_recipient_type TEXT;
  v_initiator_name TEXT;
BEGIN
  IF NEW.status <> 'pending' THEN
    RETURN NEW;
  END IF;

  v_recipient_user_id := public.connection_recipient_user_id(NEW);
  v_initiator_user_id := public.connection_initiator_user_id(NEW);
  v_recipient_type := public.connection_recipient_participant_type(NEW);

  IF v_recipient_user_id IS NULL OR v_initiator_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_recipient_user_id = v_initiator_user_id THEN
    RETURN NEW;
  END IF;

  v_initiator_name := COALESCE(public.user_display_name(v_initiator_user_id), 'Someone');

  PERFORM public.try_create_notification(
    v_recipient_user_id,
    'connection_request_received',
    'New connection request',
    v_initiator_name || ' wants to connect with you.',
    public.connections_action_url(v_recipient_type, 'received'),
    'connection',
    NEW.id,
    v_initiator_user_id,
    jsonb_build_object('connectionId', NEW.id)
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initiator_user_id UUID;
  v_recipient_user_id UUID;
  v_initiator_type TEXT;
  v_responder_name TEXT;
BEGIN
  IF OLD.status <> 'pending' OR NEW.status <> 'connected' THEN
    RETURN NEW;
  END IF;

  v_initiator_user_id := public.connection_initiator_user_id(NEW);
  v_recipient_user_id := public.connection_recipient_user_id(NEW);

  IF v_initiator_user_id IS NULL OR v_recipient_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_initiator_type := NEW.initiator_type;
  v_responder_name := COALESCE(public.user_display_name(v_recipient_user_id), 'Someone');

  PERFORM public.try_create_notification(
    v_initiator_user_id,
    'connection_request_accepted',
    'Connection accepted',
    v_responder_name || ' accepted your connection request.',
    public.connections_action_url(v_initiator_type, 'connected'),
    'connection',
    NEW.id,
    v_recipient_user_id,
    jsonb_build_object('connectionId', NEW.id)
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_connection_rejected()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initiator_user_id UUID;
  v_recipient_user_id UUID;
  v_initiator_type TEXT;
  v_responder_name TEXT;
BEGIN
  IF OLD.status <> 'pending' THEN
    RETURN OLD;
  END IF;

  v_initiator_user_id := public.connection_initiator_user_id(OLD);
  v_recipient_user_id := public.connection_recipient_user_id(OLD);

  IF v_initiator_user_id IS NULL OR v_recipient_user_id IS NULL THEN
    RETURN OLD;
  END IF;

  v_initiator_type := OLD.initiator_type;
  v_responder_name := COALESCE(public.user_display_name(v_recipient_user_id), 'Someone');

  PERFORM public.try_create_notification(
    v_initiator_user_id,
    'connection_request_rejected',
    'Connection request declined',
    v_responder_name || ' declined your connection request.',
    public.connections_action_url(v_initiator_type, 'sent'),
    'connection',
    OLD.id,
    v_recipient_user_id,
    jsonb_build_object('connectionId', OLD.id)
  );

  RETURN OLD;
END;
$$;

CREATE TRIGGER connections_notify_insert
  AFTER INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_insert();

CREATE TRIGGER connections_notify_accepted
  AFTER UPDATE OF status ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_accepted();

CREATE TRIGGER connections_notify_rejected
  BEFORE DELETE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_rejected();

-- ---------------------------------------------------------------------------
-- Job applications
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_job_application_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_user_id UUID;
  v_candidate_user_id UUID;
  v_job_title TEXT;
  v_candidate_name TEXT;
  v_action_url TEXT;
BEGIN
  SELECT r.user_id, jp.title
  INTO v_recruiter_user_id, v_job_title
  FROM public.job_postings jp
  INNER JOIN public.recruiters r ON r.id = jp.recruiter_id
  WHERE jp.id = NEW.job_posting_id;

  SELECT c.user_id
  INTO v_candidate_user_id
  FROM public.candidates c
  WHERE c.id = NEW.candidate_id;

  IF v_recruiter_user_id IS NULL OR v_candidate_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_candidate_name := COALESCE(public.user_display_name(v_candidate_user_id), 'A candidate');
  v_job_title := COALESCE(NULLIF(btrim(v_job_title), ''), 'your job');
  v_action_url := '/recruiter/jobs/'
    || NEW.job_posting_id::text
    || '/applicants?application='
    || NEW.id::text;

  PERFORM public.try_create_notification(
    v_recruiter_user_id,
    'job_application_received',
    'New job application',
    v_candidate_name || ' applied for ' || v_job_title || '.',
    v_action_url,
    'job_application',
    NEW.id,
    v_candidate_user_id,
    jsonb_build_object(
      'jobId', NEW.job_posting_id,
      'applicationId', NEW.id,
      'candidateId', NEW.candidate_id
    )
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_job_application_status_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_user_id UUID;
  v_recruiter_user_id UUID;
  v_job_title TEXT;
  v_recruiter_name TEXT;
  v_status_label TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT c.user_id
  INTO v_candidate_user_id
  FROM public.candidates c
  WHERE c.id = NEW.candidate_id;

  SELECT r.user_id, jp.title
  INTO v_recruiter_user_id, v_job_title
  FROM public.job_postings jp
  INNER JOIN public.recruiters r ON r.id = jp.recruiter_id
  WHERE jp.id = NEW.job_posting_id;

  IF v_candidate_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_status_label := public.job_application_status_label(NEW.status);
  v_job_title := COALESCE(NULLIF(btrim(v_job_title), ''), 'a job');
  v_recruiter_name := COALESCE(public.user_display_name(v_recruiter_user_id), 'The recruiter');

  PERFORM public.try_create_notification(
    v_candidate_user_id,
    'job_application_status_updated',
    'Application status updated',
    v_recruiter_name || ' moved your application for ' || v_job_title || ' to ' || v_status_label || '.',
    '/my-profile?tab=jobs',
    'job_application',
    NEW.id,
    v_recruiter_user_id,
    jsonb_build_object(
      'jobId', NEW.job_posting_id,
      'applicationId', NEW.id,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER job_applications_notify_insert
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_job_application_insert();

CREATE TRIGGER job_applications_notify_status_update
  AFTER UPDATE OF status ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_job_application_status_update();

-- ---------------------------------------------------------------------------
-- References
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_reference_request_status_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_user_id UUID;
  v_referee_name TEXT;
  v_notification_type TEXT;
  v_title TEXT;
  v_body TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('submitted', 'verified', 'rejected') THEN
    RETURN NEW;
  END IF;

  SELECT c.user_id
  INTO v_candidate_user_id
  FROM public.candidates c
  WHERE c.id = NEW.candidate_id;

  IF v_candidate_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_referee_name := COALESCE(NULLIF(btrim(NEW.referee_name), ''), 'Your referee');

  IF NEW.status = 'submitted' THEN
    v_notification_type := 'reference_submitted';
    v_title := 'Reference submitted';
    v_body := v_referee_name || ' submitted a reference for you.';
  ELSIF NEW.status = 'verified' THEN
    v_notification_type := 'reference_verified';
    v_title := 'Reference verified';
    v_body := v_referee_name || '''s reference has been verified.';
  ELSE
    v_notification_type := 'reference_rejected';
    v_title := 'Reference declined';
    v_body := v_referee_name || '''s reference could not be verified.';
  END IF;

  PERFORM public.try_create_notification(
    v_candidate_user_id,
    v_notification_type,
    v_title,
    v_body,
    '/my-profile?tab=references',
    'reference_request',
    NEW.id,
    NEW.referee_user_id,
    jsonb_build_object('referenceRequestId', NEW.id, 'status', NEW.status)
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_reference_grant_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_user_id UUID;
  v_candidate_user_id UUID;
  v_candidate_name TEXT;
  v_vodora_id TEXT;
  v_action_url TEXT;
BEGIN
  IF NEW.grant_source = 'job_application' THEN
    RETURN NEW;
  END IF;

  IF NEW.revoked_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT r.user_id
  INTO v_recruiter_user_id
  FROM public.recruiters r
  WHERE r.id = NEW.recruiter_id;

  SELECT c.user_id, c.vodora_id
  INTO v_candidate_user_id, v_vodora_id
  FROM public.candidates c
  WHERE c.id = NEW.candidate_id;

  IF v_recruiter_user_id IS NULL OR v_candidate_user_id IS NULL OR v_vodora_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_candidate_name := COALESCE(public.user_display_name(v_candidate_user_id), 'A candidate');
  v_action_url := '/recruiter/candidates/' || v_vodora_id;

  PERFORM public.try_create_notification(
    v_recruiter_user_id,
    'reference_grant_received',
    'References shared with you',
    v_candidate_name || ' shared references with you.',
    v_action_url,
    'reference_grant',
    NEW.id,
    v_candidate_user_id,
    jsonb_build_object(
      'grantId', NEW.id,
      'candidateId', NEW.candidate_id,
      'grantSource', NEW.grant_source
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER reference_requests_notify_status_update
  AFTER UPDATE OF status ON public.reference_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_reference_request_status_update();

CREATE TRIGGER reference_recruiter_grants_notify_insert
  AFTER INSERT ON public.reference_recruiter_grants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_reference_grant_insert();
