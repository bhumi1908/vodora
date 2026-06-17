-- Auth, candidate, and recruiter login/signup schema (schema_reference.pdf)
-- Supabase Auth: passwords live in auth.users; public.users.id = auth.users.id

-- ---------------------------------------------------------------------------
-- Extensions & shared helpers
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.slugify_company_name(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(trim(input), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+',
      '-',
      'g'
    )
  );
END;
$$;

-- Sync auth.users → public.users (signup metadata from Supabase Auth)
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
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Table 1 — users
-- ---------------------------------------------------------------------------

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  country VARCHAR(100),
  city VARCHAR(100),
  terms_accepted_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX users_email_idx ON public.users (email);
CREATE INDEX users_is_active_idx ON public.users (is_active);

-- ---------------------------------------------------------------------------
-- Table 2 — roles
-- ---------------------------------------------------------------------------

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT roles_name_check CHECK (
    name IN (
      'candidate',
      'recruiter',
      'company_admin',
      'company_member',
      'admin'
    )
  )
);

INSERT INTO public.roles (name, description) VALUES
  ('candidate', 'Job seeker / candidate account'),
  ('recruiter', 'Recruiter or hiring professional');

-- ---------------------------------------------------------------------------
-- Table 3 — user_roles
-- ---------------------------------------------------------------------------

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id, role_id)
);

CREATE INDEX user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX user_roles_role_id_idx ON public.user_roles (role_id);

-- ---------------------------------------------------------------------------
-- Table 8 — industry_categories (lookup, before candidates FK)
-- ---------------------------------------------------------------------------

CREATE TABLE public.industry_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.industry_categories (code, name, sort_order) VALUES
  ('technology', 'Technology', 1),
  ('healthcare', 'Healthcare', 2),
  ('finance', 'Finance', 3),
  ('engineering', 'Engineering', 4),
  ('education', 'Education', 5),
  ('retail', 'Retail', 6),
  ('manufacturing', 'Manufacturing', 7),
  ('construction', 'Construction', 8),
  ('hospitality', 'Hospitality', 9),
  ('government', 'Government', 10),
  ('legal', 'Legal', 11),
  ('marketing', 'Marketing', 12),
  ('other', 'Other', 99);

-- ---------------------------------------------------------------------------
-- Table 9 — work_types (lookup, before candidate_work_types FK)
-- ---------------------------------------------------------------------------

CREATE TABLE public.work_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.work_types (code, name, sort_order) VALUES
  ('full_time', 'Full Time', 1),
  ('part_time', 'Part Time', 2),
  ('contract', 'Contract', 3),
  ('freelance', 'Freelance', 4),
  ('labour_hire', 'Labour Hire', 5),
  ('casual', 'Casual', 6),
  ('remote', 'Remote', 7),
  ('fifo', 'FIFO (Fly-In Fly-Out)', 8);

-- ---------------------------------------------------------------------------
-- Table 4 — candidates
-- ---------------------------------------------------------------------------

CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE CASCADE,
  vodora_id VARCHAR(20) NOT NULL UNIQUE,
  date_of_birth DATE,
  profession VARCHAR(255),
  industry_category_id UUID REFERENCES public.industry_categories (id) ON DELETE SET NULL,
  current_position VARCHAR(255),
  current_company_name VARCHAR(255),
  headline VARCHAR(255),
  summary TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  profile_picture_url TEXT,
  availability_start VARCHAR(30),
  experience_level VARCHAR(20),
  total_years_experience SMALLINT,
  availability_status VARCHAR(30) NOT NULL DEFAULT 'not_looking',
  availability_updated_at TIMESTAMPTZ,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private',
  contract_expiry_date DATE,
  linkedin_profile_url TEXT,
  linkedin_imported_at TIMESTAMPTZ,
  linkedin_import_data JSONB,
  is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidates_availability_status_check CHECK (
    availability_status IN (
      'not_looking',
      'open',
      'actively_looking',
      'available_now'
    )
  ),
  CONSTRAINT candidates_visibility_check CHECK (
    visibility IN ('private', 'recruiters_only', 'public')
  )
);

CREATE OR REPLACE FUNCTION public.generate_vodora_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate_id TEXT;
  i INT;
BEGIN
  LOOP
    candidate_id := 'VOD-';
    FOR i IN 1..6 LOOP
      candidate_id := candidate_id || substr(
        chars,
        1 + floor(random() * length(chars))::INT,
        1
      );
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.candidates WHERE vodora_id = candidate_id
    );
  END LOOP;
  RETURN candidate_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_candidate_vodora_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.vodora_id IS NULL OR btrim(NEW.vodora_id) = '' THEN
    NEW.vodora_id := public.generate_vodora_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER candidates_set_vodora_id
  BEFORE INSERT ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_candidate_vodora_id();

CREATE TRIGGER candidates_set_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX candidates_user_id_idx ON public.candidates (user_id);
CREATE INDEX candidates_industry_category_id_idx ON public.candidates (industry_category_id);

-- ---------------------------------------------------------------------------
-- Table 6 — companies (before recruiters & company_members FKs)
-- ---------------------------------------------------------------------------

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  website VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  employee_count_range VARCHAR(20),
  hires_per_year_range VARCHAR(20),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  verification_submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT companies_employee_count_range_check CHECK (
    employee_count_range IS NULL
    OR employee_count_range IN (
      '1-10',
      '11-50',
      '51-200',
      '201-500',
      '501-1000',
      '1000+'
    )
  ),
  CONSTRAINT companies_hires_per_year_range_check CHECK (
    hires_per_year_range IS NULL
    OR hires_per_year_range IN (
      '1-5',
      '6-20',
      '21-50',
      '51-100',
      '100+'
    )
  ),
  CONSTRAINT companies_verification_status_check CHECK (
    verification_status IN ('pending', 'approved', 'rejected')
  )
);

CREATE TRIGGER companies_set_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX companies_slug_idx ON public.companies (slug);
CREATE INDEX companies_verification_status_idx ON public.companies (verification_status);

-- ---------------------------------------------------------------------------
-- Table 7 — company_members
-- ---------------------------------------------------------------------------

CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  team_role VARCHAR(50) NOT NULL,
  invited_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT company_members_company_id_user_id_key UNIQUE (company_id, user_id),
  CONSTRAINT company_members_team_role_check CHECK (
    team_role IN ('owner', 'admin', 'member')
  )
);

CREATE INDEX company_members_company_id_idx ON public.company_members (company_id);
CREATE INDEX company_members_user_id_idx ON public.company_members (user_id);

-- ---------------------------------------------------------------------------
-- Table 5 — recruiters
-- ---------------------------------------------------------------------------

CREATE TABLE public.recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  job_title VARCHAR(100),
  recruiter_type VARCHAR(50),
  candidate_search_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recruiters_recruiter_type_check CHECK (
    recruiter_type IS NULL
    OR recruiter_type IN (
      'internal_recruiter',
      'recruitment_agency',
      'labour_hire_company',
      'hiring_manager',
      'business_owner'
    )
  )
);

CREATE TRIGGER recruiters_set_updated_at
  BEFORE UPDATE ON public.recruiters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX recruiters_user_id_idx ON public.recruiters (user_id);
CREATE INDEX recruiters_company_id_idx ON public.recruiters (company_id);

-- ---------------------------------------------------------------------------
-- Table 10 — candidate_work_types
-- ---------------------------------------------------------------------------

CREATE TABLE public.candidate_work_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  work_type_id UUID NOT NULL REFERENCES public.work_types (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidate_work_types_candidate_id_work_type_id_key UNIQUE (candidate_id, work_type_id)
);

CREATE INDEX candidate_work_types_candidate_id_idx ON public.candidate_work_types (candidate_id);
CREATE INDEX candidate_work_types_work_type_id_idx ON public.candidate_work_types (work_type_id);

-- ---------------------------------------------------------------------------
-- Auth hook: create public.users row when auth.users is created
-- ---------------------------------------------------------------------------

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Login helper: update last_login_at (call from app after successful sign-in)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_user_login(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET last_login_at = now()
  WHERE id = user_uuid
    AND is_active = TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.record_user_login(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_user_login(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_work_types ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- roles (read-only for authenticated users)
CREATE POLICY roles_select_all ON public.roles
  FOR SELECT TO authenticated
  USING (TRUE);

-- user_roles
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_roles_insert_own ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- candidates
CREATE POLICY candidates_select_own ON public.candidates
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY candidates_insert_own ON public.candidates
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY candidates_update_own ON public.candidates
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- recruiters
CREATE POLICY recruiters_select_own ON public.recruiters
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY recruiters_insert_own ON public.recruiters
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY recruiters_update_own ON public.recruiters
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- companies (members can read their company)
CREATE POLICY companies_select_member ON public.companies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id = auth.uid()
        AND cm.is_active = TRUE
    )
  );

CREATE POLICY companies_insert_authenticated ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY companies_update_member ON public.companies
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id = auth.uid()
        AND cm.team_role IN ('owner', 'admin')
        AND cm.is_active = TRUE
    )
  );

-- company_members
CREATE POLICY company_members_select_own ON public.company_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY company_members_insert_own ON public.company_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- lookup tables (signup forms)
CREATE POLICY industry_categories_select_active ON public.industry_categories
  FOR SELECT TO authenticated, anon
  USING (is_active = TRUE);

CREATE POLICY work_types_select_active ON public.work_types
  FOR SELECT TO authenticated, anon
  USING (is_active = TRUE);

-- candidate_work_types
CREATE POLICY candidate_work_types_select_own ON public.candidate_work_types
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_work_types.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_work_types_insert_own ON public.candidate_work_types
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_work_types.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_work_types_delete_own ON public.candidate_work_types
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_work_types.candidate_id
        AND c.user_id = auth.uid()
    )
  );

-- Grants (Supabase service role bypasses RLS for server-side signup flows)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.industry_categories, public.work_types TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.candidates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.recruiters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT SELECT, INSERT ON public.company_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.candidate_work_types TO authenticated;
