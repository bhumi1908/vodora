-- Custom email verification (SendGrid) must not be bypassed by Supabase auto-confirm.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    email_verified_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(btrim(NEW.raw_user_meta_data->>'first_name'), ''), 'Unknown'),
    COALESCE(NULLIF(btrim(NEW.raw_user_meta_data->>'last_name'), ''), 'User'),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
