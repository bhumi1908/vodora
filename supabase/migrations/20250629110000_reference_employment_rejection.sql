-- When a referee declines employment verification, mark the request as rejected.

CREATE OR REPLACE FUNCTION public.handle_reference_response_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auto_verify BOOLEAN;
BEGIN
  IF NEW.employment_confirmed = FALSE THEN
    UPDATE public.reference_requests rr
    SET
      status = 'rejected',
      submitted_at = COALESCE(rr.submitted_at, NEW.submitted_at),
      rejection_reason = 'Referee indicated they did not work with the candidate.',
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
      'admin',
      'failed',
      'Referee declined employment verification'
    );

    RETURN NEW;
  END IF;

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
