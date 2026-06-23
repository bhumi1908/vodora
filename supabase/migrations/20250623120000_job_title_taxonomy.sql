-- Job title taxonomy: category → subcategory → job title
-- Used for candidate registration and reusable job title selection.

CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  industry_category_id UUID REFERENCES public.industry_categories (id) ON DELETE SET NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.job_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.job_categories (id) ON DELETE CASCADE,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, code)
);

CREATE TABLE public.job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES public.job_subcategories (id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subcategory_id, name)
);

CREATE INDEX job_subcategories_category_id_idx
  ON public.job_subcategories (category_id);

CREATE INDEX job_titles_subcategory_id_idx
  ON public.job_titles (subcategory_id);

ALTER TABLE public.candidates
  ADD COLUMN job_title_id UUID REFERENCES public.job_titles (id) ON DELETE SET NULL;

CREATE INDEX candidates_job_title_id_idx
  ON public.candidates (job_title_id)
  WHERE job_title_id IS NOT NULL;

-- Seed categories (mapped to existing industry_categories where possible)
INSERT INTO public.job_categories (code, name, industry_category_id, sort_order)
SELECT seed.code, seed.name, ic.id, seed.sort_order
FROM (
  VALUES
    ('information_technology', 'Information Technology', 'technology', 1),
    ('accounting_finance', 'Accounting & Finance', 'finance', 2),
    ('human_resources', 'Human Resources', 'other', 3),
    ('sales', 'Sales', 'other', 4),
    ('marketing', 'Marketing', 'marketing', 5),
    ('healthcare', 'Healthcare', 'healthcare', 6),
    ('education', 'Education', 'education', 7),
    ('engineering', 'Engineering', 'engineering', 8),
    ('construction', 'Construction', 'construction', 9),
    ('manufacturing', 'Manufacturing', 'manufacturing', 10),
    ('mining_resources', 'Mining & Resources', 'other', 11),
    ('transport_logistics', 'Transport & Logistics', 'other', 12),
    ('hospitality_tourism', 'Hospitality & Tourism', 'hospitality', 13),
    ('retail', 'Retail', 'retail', 14),
    ('government_public_sector', 'Government & Public Sector', 'government', 15),
    ('legal', 'Legal', 'legal', 16),
    ('insurance', 'Insurance', 'finance', 17),
    ('real_estate_property', 'Real Estate & Property', 'other', 18),
    ('customer_service', 'Customer Service', 'other', 19),
    ('administration_office_support', 'Administration & Office Support', 'other', 20),
    ('security_defence', 'Security & Defence', 'other', 21),
    ('agriculture_farming', 'Agriculture & Farming', 'other', 22),
    ('energy_utilities', 'Energy & Utilities', 'other', 23),
    ('creative_design', 'Creative & Design', 'marketing', 24),
    ('telecommunications', 'Telecommunications', 'technology', 25),
    ('science_research', 'Science & Research', 'other', 26),
    ('community_services_non_profit', 'Community Services & Non-Profit', 'other', 27),
    ('aviation', 'Aviation', 'other', 28),
    ('maritime', 'Maritime', 'other', 29),
    ('executive_leadership', 'Executive & Leadership', 'other', 30)
) AS seed(code, name, industry_code, sort_order)
LEFT JOIN public.industry_categories ic
  ON ic.code = seed.industry_code
  AND ic.is_active = TRUE;

-- Seed subcategories
WITH taxonomy AS (
  SELECT *
  FROM (
    VALUES
      ('information_technology', 'software_development', 'Software Development', 'Software Engineer', 1),
      ('information_technology', 'software_development', 'Software Development', 'Full Stack Developer', 2),
      ('information_technology', 'infrastructure_cloud', 'Infrastructure & Cloud', 'Cloud Engineer', 1),
      ('accounting_finance', 'accounting', 'Accounting', 'Accountant', 1),
      ('accounting_finance', 'payroll_ar_ap', 'Payroll & AR/AP', 'Payroll Officer', 1),
      ('human_resources', 'recruitment', 'Recruitment', 'Recruiter', 1),
      ('human_resources', 'hr', 'HR', 'HR Manager', 1),
      ('sales', 'business_development', 'Business Development', 'Business Development Manager', 1),
      ('marketing', 'digital_marketing', 'Digital Marketing', 'SEO Specialist', 1),
      ('healthcare', 'nursing', 'Nursing', 'Registered Nurse', 1),
      ('healthcare', 'allied_health', 'Allied Health', 'Physiotherapist', 1),
      ('education', 'schools', 'Schools', 'Teacher', 1),
      ('engineering', 'civil', 'Civil', 'Civil Engineer', 1),
      ('construction', 'trades', 'Trades', 'Electrician', 1),
      ('manufacturing', 'production', 'Production', 'Machine Operator', 1),
      ('mining_resources', 'operations', 'Operations', 'Dump Truck Operator', 1),
      ('transport_logistics', 'warehousing', 'Warehousing', 'Forklift Operator', 1),
      ('hospitality_tourism', 'food_services', 'Food Services', 'Chef', 1),
      ('retail', 'store_operations', 'Store Operations', 'Store Manager', 1),
      ('government_public_sector', 'administration', 'Administration', 'Policy Officer', 1),
      ('legal', 'legal_practice', 'Legal Practice', 'Lawyer', 1),
      ('insurance', 'claims', 'Claims', 'Claims Officer', 1),
      ('real_estate_property', 'property', 'Property', 'Property Manager', 1),
      ('customer_service', 'contact_centre', 'Contact Centre', 'Customer Support Officer', 1),
      ('administration_office_support', 'administration', 'Administration', 'Administrator', 1),
      ('security_defence', 'security', 'Security', 'Security Guard', 1),
      ('agriculture_farming', 'farming', 'Farming', 'Farm Manager', 1),
      ('energy_utilities', 'renewable_energy', 'Renewable Energy', 'Solar Technician', 1),
      ('creative_design', 'design', 'Design', 'Graphic Designer', 1),
      ('telecommunications', 'technical', 'Technical', 'Telecom Technician', 1),
      ('science_research', 'research', 'Research', 'Research Scientist', 1),
      ('community_services_non_profit', 'social_services', 'Social Services', 'Social Worker', 1),
      ('aviation', 'flight_operations', 'Flight Operations', 'Pilot', 1),
      ('maritime', 'deck', 'Deck', 'Captain', 1),
      ('executive_leadership', 'executive', 'Executive', 'CEO', 1)
  ) AS rows(
    category_code,
    subcategory_code,
    subcategory_name,
    job_title_name,
    title_sort_order
  )
),
distinct_subcategories AS (
  SELECT DISTINCT
    category_code,
    subcategory_code,
    subcategory_name
  FROM taxonomy
)
INSERT INTO public.job_subcategories (category_id, code, name, sort_order)
SELECT
  jc.id,
  ds.subcategory_code,
  ds.subcategory_name,
  1
FROM distinct_subcategories ds
JOIN public.job_categories jc ON jc.code = ds.category_code
ON CONFLICT (category_id, code) DO UPDATE
  SET name = EXCLUDED.name;

INSERT INTO public.job_titles (subcategory_id, name, sort_order)
SELECT
  js.id,
  t.job_title_name,
  t.title_sort_order
FROM (
  VALUES
    ('information_technology', 'software_development', 'Software Engineer', 1),
    ('information_technology', 'software_development', 'Full Stack Developer', 2),
    ('information_technology', 'infrastructure_cloud', 'Cloud Engineer', 1),
    ('accounting_finance', 'accounting', 'Accountant', 1),
    ('accounting_finance', 'payroll_ar_ap', 'Payroll Officer', 1),
    ('human_resources', 'recruitment', 'Recruiter', 1),
    ('human_resources', 'hr', 'HR Manager', 1),
    ('sales', 'business_development', 'Business Development Manager', 1),
    ('marketing', 'digital_marketing', 'SEO Specialist', 1),
    ('healthcare', 'nursing', 'Registered Nurse', 1),
    ('healthcare', 'allied_health', 'Physiotherapist', 1),
    ('education', 'schools', 'Teacher', 1),
    ('engineering', 'civil', 'Civil Engineer', 1),
    ('construction', 'trades', 'Electrician', 1),
    ('manufacturing', 'production', 'Machine Operator', 1),
    ('mining_resources', 'operations', 'Dump Truck Operator', 1),
    ('transport_logistics', 'warehousing', 'Forklift Operator', 1),
    ('hospitality_tourism', 'food_services', 'Chef', 1),
    ('retail', 'store_operations', 'Store Manager', 1),
    ('government_public_sector', 'administration', 'Policy Officer', 1),
    ('legal', 'legal_practice', 'Lawyer', 1),
    ('insurance', 'claims', 'Claims Officer', 1),
    ('real_estate_property', 'property', 'Property Manager', 1),
    ('customer_service', 'contact_centre', 'Customer Support Officer', 1),
    ('administration_office_support', 'administration', 'Administrator', 1),
    ('security_defence', 'security', 'Security Guard', 1),
    ('agriculture_farming', 'farming', 'Farm Manager', 1),
    ('energy_utilities', 'renewable_energy', 'Solar Technician', 1),
    ('creative_design', 'design', 'Graphic Designer', 1),
    ('telecommunications', 'technical', 'Telecom Technician', 1),
    ('science_research', 'research', 'Research Scientist', 1),
    ('community_services_non_profit', 'social_services', 'Social Worker', 1),
    ('aviation', 'flight_operations', 'Pilot', 1),
    ('maritime', 'deck', 'Captain', 1),
    ('executive_leadership', 'executive', 'CEO', 1)
) AS t(category_code, subcategory_code, job_title_name, title_sort_order)
JOIN public.job_categories jc ON jc.code = t.category_code
JOIN public.job_subcategories js
  ON js.category_id = jc.id
 AND js.code = t.subcategory_code
ON CONFLICT (subcategory_id, name) DO UPDATE
  SET sort_order = EXCLUDED.sort_order;

ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY job_categories_select_active ON public.job_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY job_subcategories_select_active ON public.job_subcategories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY job_titles_select_active ON public.job_titles
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

GRANT SELECT ON public.job_categories, public.job_subcategories, public.job_titles
  TO anon, authenticated;

-- Extend candidate registration to persist selected job title
DROP FUNCTION IF EXISTS public.register_candidate(TEXT, TEXT, TEXT, UUID, TEXT[], BOOLEAN);

CREATE OR REPLACE FUNCTION public.register_candidate(
  p_country TEXT,
  p_city TEXT,
  p_profession TEXT,
  p_industry_category_id UUID,
  p_work_type_codes TEXT[],
  p_terms_accepted BOOLEAN DEFAULT TRUE,
  p_job_title_id UUID DEFAULT NULL
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
    job_title_id,
    country,
    city
  )
  VALUES (
    v_user_id,
    NULLIF(btrim(p_profession), ''),
    p_industry_category_id,
    p_job_title_id,
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

REVOKE ALL ON FUNCTION public.register_candidate(TEXT, TEXT, TEXT, UUID, TEXT[], BOOLEAN, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_candidate(TEXT, TEXT, TEXT, UUID, TEXT[], BOOLEAN, UUID) TO authenticated;
