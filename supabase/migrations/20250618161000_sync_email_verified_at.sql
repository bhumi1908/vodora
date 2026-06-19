-- Keep public.users.email_verified_at in sync when auth.users.email_confirmed_at is set

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
    AND (
      OLD.email_confirmed_at IS NULL
      OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at
    )
  THEN
    UPDATE public.users
    SET email_verified_at = NEW.email_confirmed_at
    WHERE id = NEW.id
      AND (email_verified_at IS NULL OR email_verified_at < NEW.email_confirmed_at);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_email_confirmed();
