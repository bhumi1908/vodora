-- User feedback: one submission per authenticated user.

CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  feedback_type TEXT NOT NULL CHECK (
    feedback_type IN (
      'working',
      'not-working',
      'needs-improvement',
      'new-feature'
    )
  ),
  selected_feature TEXT,
  details TEXT NOT NULL,
  new_feature_title TEXT,
  new_feature_desc TEXT,
  contact_email TEXT,
  can_contact BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX user_feedback_created_at_idx ON public.user_feedback (created_at DESC);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_feedback_select_own ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_feedback_insert_own ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
