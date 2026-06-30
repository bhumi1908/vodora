-- Phase 6: deduplicate rapid duplicate notifications within a short window.

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
DECLARE
  v_existing_id UUID;
BEGIN
  IF p_recipient_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_entity_id IS NOT NULL AND p_entity_type IS NOT NULL THEN
    SELECT n.id
    INTO v_existing_id
    FROM public.notifications n
    WHERE n.recipient_user_id = p_recipient_user_id
      AND n.type = p_type
      AND n.entity_type = p_entity_type
      AND n.entity_id = p_entity_id
      AND (
        p_type <> 'job_application_status_updated'
        OR n.metadata ->> 'status' IS NOT DISTINCT FROM p_metadata ->> 'status'
      )
      AND n.created_at > now() - INTERVAL '2 minutes'
    ORDER BY n.created_at DESC
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      RETURN v_existing_id;
    END IF;
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
