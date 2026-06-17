-- Atomic signup profile completion (called after Supabase Auth signUp + session)

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

  SELECT id INTO v_candidate_id
  FROM public.candidates
  WHERE user_id = v_user_id;

  IF v_candidate_id IS NOT NULL THEN
    RETURN v_candidate_id;
  END IF;

  UPDATE public.users
  SET
    country = NULLIF(btrim(p_country), ''),
    city = NULLIF(btrim(p_city), ''),
    terms_accepted_at = now()
  WHERE id = v_user_id;

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
    city
  )
  VALUES (
    v_user_id,
    NULLIF(btrim(p_profession), ''),
    p_industry_category_id,
    NULLIF(btrim(p_country), ''),
    NULLIF(btrim(p_city), '')
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

CREATE OR REPLACE FUNCTION public.register_recruiter(
  p_country TEXT,
  p_city TEXT,
  p_company_name TEXT,
  p_job_title TEXT,
  p_website TEXT,
  p_employee_count_range TEXT,
  p_hires_per_year_range TEXT,
  p_recruiter_type TEXT,
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
  v_company_id UUID;
  v_recruiter_id UUID;
  v_slug TEXT;
  v_base_slug TEXT;
  v_suffix INT := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT COALESCE(p_terms_accepted, FALSE) THEN
    RAISE EXCEPTION 'Terms must be accepted';
  END IF;

  SELECT id INTO v_recruiter_id
  FROM public.recruiters
  WHERE user_id = v_user_id;

  IF v_recruiter_id IS NOT NULL THEN
    RETURN v_recruiter_id;
  END IF;

  UPDATE public.users
  SET
    country = NULLIF(btrim(p_country), ''),
    city = NULLIF(btrim(p_city), ''),
    terms_accepted_at = now()
  WHERE id = v_user_id;

  SELECT id INTO v_role_id
  FROM public.roles
  WHERE name = 'recruiter';

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Recruiter role not found';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  v_base_slug := public.slugify_company_name(p_company_name);
  IF v_base_slug IS NULL OR btrim(v_base_slug) = '' THEN
    v_base_slug := 'company';
  END IF;

  v_slug := v_base_slug;
  WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = v_slug) LOOP
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix::TEXT;
  END LOOP;

  INSERT INTO public.companies (
    name,
    slug,
    website,
    country,
    city,
    employee_count_range,
    hires_per_year_range
  )
  VALUES (
    NULLIF(btrim(p_company_name), ''),
    v_slug,
    NULLIF(btrim(p_website), ''),
    NULLIF(btrim(p_country), ''),
    NULLIF(btrim(p_city), ''),
    p_employee_count_range,
    p_hires_per_year_range
  )
  RETURNING id INTO v_company_id;

  INSERT INTO public.company_members (company_id, user_id, team_role)
  VALUES (v_company_id, v_user_id, 'owner');

  INSERT INTO public.recruiters (
    user_id,
    company_id,
    job_title,
    recruiter_type
  )
  VALUES (
    v_user_id,
    v_company_id,
    NULLIF(btrim(p_job_title), ''),
    p_recruiter_type
  )
  RETURNING id INTO v_recruiter_id;

  RETURN v_recruiter_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_candidate(TEXT, TEXT, TEXT, UUID, TEXT[], BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_recruiter(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_candidate(TEXT, TEXT, TEXT, UUID, TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_recruiter(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
