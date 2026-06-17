-- Secure record_user_login: callers may only update their own row (fixes IDOR).

DROP FUNCTION IF EXISTS public.record_user_login(UUID);

CREATE OR REPLACE FUNCTION public.record_user_login()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.users
  SET
    last_login_at = now(),
    login_count = login_count + 1
  WHERE id = auth.uid()
    AND is_active = TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.record_user_login() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_user_login() TO authenticated;
