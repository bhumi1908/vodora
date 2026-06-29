-- Allow reference responses without a logged-in referee (token-based submission).
ALTER TABLE public.reference_responses
  ALTER COLUMN submitted_by_user_id DROP NOT NULL;
