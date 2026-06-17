-- Track login count so first login can show onboarding welcome screens.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS login_count INT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.record_user_login(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET
    last_login_at = now(),
    login_count = login_count + 1
  WHERE id = user_uuid
    AND is_active = TRUE;
END;
$$;
