-- Candidates must be visible to recruiters to appear on the recruiter dashboard.
-- Default was 'private', which hid all candidates until visibility was changed manually.

UPDATE public.candidates
SET visibility = 'recruiters_only'
WHERE visibility = 'private';

ALTER TABLE public.candidates
  ALTER COLUMN visibility SET DEFAULT 'recruiters_only';

CREATE OR REPLACE FUNCTION public.register_candidate(
  p_country TEXT,
  p_city TEXT,
  p_profession TEXT,
  p_industry_category_id UUID,
  p_work_type_codes TEXT[],
  p_terms_accepted BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_role_id UUID;
  v_candidate_id UUID;
  v_code TEXT;
  v_work_type_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT COALESCE(p_terms_accepted, FALSE) THEN
    RAISE EXCEPTION 'Terms must be accepted';
  END IF;

  IF p_work_type_codes IS NULL OR array_length(p_work_type_codes, 1) IS NULL THEN
    RAISE EXCEPTION 'At least one work type is required';
  END IF;

  UPDATE public.users
  SET
    country = NULLIF(btrim(p_country), ''),
    city = NULLIF(btrim(p_city), ''),
    terms_accepted_at = COALESCE(terms_accepted_at, now())
  WHERE id = v_user_id;

  SELECT id INTO v_candidate_id
  FROM public.candidates
  WHERE user_id = v_user_id;

  IF v_candidate_id IS NOT NULL THEN
    RETURN v_candidate_id;
  END IF;

  SELECT id INTO v_role_id
  FROM public.roles
  WHERE name = 'candidate';

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Candidate role not found';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  INSERT INTO public.candidates (
    user_id,
    profession,
    industry_category_id,
    country,
    city,
    visibility
  )
  VALUES (
    v_user_id,
    NULLIF(btrim(p_profession), ''),
    p_industry_category_id,
    NULLIF(btrim(p_country), ''),
    NULLIF(btrim(p_city), ''),
    'recruiters_only'
  )
  RETURNING id INTO v_candidate_id;

  FOREACH v_code IN ARRAY p_work_type_codes LOOP
    SELECT id INTO v_work_type_id
    FROM public.work_types
    WHERE code = v_code
      AND is_active = TRUE;

    IF v_work_type_id IS NOT NULL THEN
      INSERT INTO public.candidate_work_types (candidate_id, work_type_id)
      VALUES (v_candidate_id, v_work_type_id)
      ON CONFLICT (candidate_id, work_type_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_candidate_id;
END;
$$;
