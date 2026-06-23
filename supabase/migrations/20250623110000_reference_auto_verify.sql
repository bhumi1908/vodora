-- Reference auto-verification flag and updated submission lifecycle.

ALTER TABLE public.reference_requests
  ADD COLUMN IF NOT EXISTS require_company_email BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.reference_requests.require_company_email IS
  'When true, auto-verify only if referee email is a company domain. When false, auto-verify regardless (e.g. yopmail testing).';

CREATE OR REPLACE FUNCTION public.is_personal_email_domain(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(split_part(btrim(p_email), '@', 2)) IN (
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.co.uk',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'me.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'mail.com',
    'gmx.com',
    'msn.com',
    'yopmail.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.should_auto_verify_reference(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN rr.require_company_email = FALSE THEN TRUE
    WHEN public.is_personal_email_domain(rr.referee_email) THEN FALSE
    ELSE TRUE
  END
  FROM public.reference_requests rr
  WHERE rr.id = p_request_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_reference_response_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auto_verify BOOLEAN;
BEGIN
  SELECT public.should_auto_verify_reference(NEW.reference_request_id)
  INTO v_auto_verify;

  IF v_auto_verify THEN
    UPDATE public.reference_requests rr
    SET
      status = 'verified',
      submitted_at = COALESCE(rr.submitted_at, NEW.submitted_at),
      verified_at = now(),
      referee_user_id = COALESCE(rr.referee_user_id, NEW.submitted_by_user_id),
      updated_at = now()
    WHERE rr.id = NEW.reference_request_id
      AND rr.status = 'pending'
      AND rr.invitation_expires_at > now();

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Reference request is not open for submission';
    END IF;

    INSERT INTO public.reference_verifications (
      reference_request_id,
      method,
      status,
      notes
    )
    VALUES (
      NEW.reference_request_id,
      CASE
        WHEN (
          SELECT require_company_email
          FROM public.reference_requests
          WHERE id = NEW.reference_request_id
        ) = FALSE THEN 'admin'
        ELSE 'email_domain'
      END,
      'passed',
      'Auto-verified on submission'
    );
  ELSE
    UPDATE public.reference_requests rr
    SET
      status = 'submitted',
      submitted_at = COALESCE(rr.submitted_at, NEW.submitted_at),
      referee_user_id = COALESCE(rr.referee_user_id, NEW.submitted_by_user_id),
      updated_at = now()
    WHERE rr.id = NEW.reference_request_id
      AND rr.status = 'pending'
      AND rr.invitation_expires_at > now();

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Reference request is not open for submission';
    END IF;

    INSERT INTO public.reference_verifications (
      reference_request_id,
      method,
      status
    )
    VALUES (
      NEW.reference_request_id,
      'admin',
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$;
