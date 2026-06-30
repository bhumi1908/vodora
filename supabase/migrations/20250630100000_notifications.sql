-- In-app notifications: persisted inbox for connections, applications, and references.
-- Phase 1 schema only — event triggers are added in a later migration.

-- ---------------------------------------------------------------------------
-- Table — notifications
-- ---------------------------------------------------------------------------

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  action_url TEXT NOT NULL,
  entity_type VARCHAR(30),
  entity_id UUID,
  actor_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'connection_request_received',
      'connection_request_accepted',
      'connection_request_rejected',
      'job_application_received',
      'job_application_status_updated',
      'reference_submitted',
      'reference_verified',
      'reference_rejected',
      'reference_grant_received'
    )
  ),
  CONSTRAINT notifications_entity_type_check CHECK (
    entity_type IS NULL
    OR entity_type IN (
      'connection',
      'job_application',
      'reference_request',
      'reference_grant'
    )
  ),
  CONSTRAINT notifications_action_url_check CHECK (
    char_length(btrim(action_url)) >= 1
    AND action_url LIKE '/%'
  ),
  CONSTRAINT notifications_title_check CHECK (
    char_length(btrim(title)) >= 1
  )
);

COMMENT ON TABLE public.notifications IS
  'Per-user in-app notification inbox. Rows are created by server-side triggers/RPCs only.';

CREATE INDEX notifications_recipient_created_idx
  ON public.notifications (recipient_user_id, created_at DESC);

CREATE INDEX notifications_recipient_unread_idx
  ON public.notifications (recipient_user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX notifications_entity_idx
  ON public.notifications (entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- RLS — recipients can read, mark read, and delete their own notifications
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT
  TO authenticated
  USING (recipient_user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_user_id = auth.uid())
  WITH CHECK (recipient_user_id = auth.uid());

CREATE POLICY notifications_delete_own ON public.notifications
  FOR DELETE
  TO authenticated
  USING (recipient_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Helper — create_notification (SECURITY DEFINER, server/trigger use only)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_notification(
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
  v_notification_id UUID;
  v_trimmed_title TEXT;
  v_trimmed_action_url TEXT;
BEGIN
  IF p_recipient_user_id IS NULL THEN
    RAISE EXCEPTION 'Recipient user id is required';
  END IF;

  IF p_type IS NULL OR btrim(p_type) = '' THEN
    RAISE EXCEPTION 'Notification type is required';
  END IF;

  v_trimmed_title := btrim(p_title);

  IF v_trimmed_title IS NULL OR v_trimmed_title = '' THEN
    RAISE EXCEPTION 'Notification title is required';
  END IF;

  v_trimmed_action_url := btrim(p_action_url);

  IF v_trimmed_action_url IS NULL OR v_trimmed_action_url = '' THEN
    RAISE EXCEPTION 'Notification action_url is required';
  END IF;

  IF v_trimmed_action_url NOT LIKE '/%' THEN
    RAISE EXCEPTION 'Notification action_url must start with /';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_recipient_user_id
      AND u.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Recipient user not found or inactive';
  END IF;

  INSERT INTO public.notifications (
    recipient_user_id,
    type,
    title,
    body,
    action_url,
    entity_type,
    entity_id,
    actor_user_id,
    metadata
  )
  VALUES (
    p_recipient_user_id,
    p_type,
    v_trimmed_title,
    NULLIF(btrim(p_body), ''),
    v_trimmed_action_url,
    NULLIF(btrim(p_entity_type), ''),
    p_entity_id,
    p_actor_user_id,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(
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

GRANT EXECUTE ON FUNCTION public.create_notification(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  UUID,
  UUID,
  JSONB
) TO service_role;

-- ---------------------------------------------------------------------------
-- Realtime — live badge/list updates for authenticated recipients
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
