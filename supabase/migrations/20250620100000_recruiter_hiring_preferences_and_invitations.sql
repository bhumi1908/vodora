-- Recruiter hiring preferences and company team invitations.

ALTER TABLE public.recruiters
  ADD COLUMN IF NOT EXISTS preferred_work_type_codes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_experience_levels TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS remote_preference VARCHAR(50);

ALTER TABLE public.recruiters
  DROP CONSTRAINT IF EXISTS recruiters_remote_preference_check;

ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_remote_preference_check CHECK (
    remote_preference IS NULL
    OR remote_preference IN ('remote', 'hybrid', 'on_site', 'flexible')
  );

CREATE TABLE IF NOT EXISTS public.company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  team_role VARCHAR(50) NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT company_invitations_team_role_check CHECK (
    team_role IN ('admin', 'member')
  ),
  CONSTRAINT company_invitations_status_check CHECK (
    status IN ('pending', 'accepted', 'expired', 'cancelled')
  )
);

CREATE INDEX IF NOT EXISTS company_invitations_company_id_idx
  ON public.company_invitations (company_id);

CREATE INDEX IF NOT EXISTS company_invitations_invited_by_idx
  ON public.company_invitations (invited_by);

CREATE UNIQUE INDEX IF NOT EXISTS company_invitations_pending_email_idx
  ON public.company_invitations (company_id, lower(email))
  WHERE status = 'pending';

ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_invitations_select_company_admin ON public.company_invitations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members cm
      WHERE cm.company_id = company_invitations.company_id
        AND cm.user_id = auth.uid()
        AND cm.is_active = TRUE
        AND cm.team_role IN ('owner', 'admin')
    )
  );

CREATE POLICY company_invitations_insert_company_admin ON public.company_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.company_members cm
      WHERE cm.company_id = company_invitations.company_id
        AND cm.user_id = auth.uid()
        AND cm.is_active = TRUE
        AND cm.team_role IN ('owner', 'admin')
    )
  );

GRANT SELECT, INSERT ON public.company_invitations TO authenticated;

CREATE OR REPLACE FUNCTION public.get_own_recruiter_profile()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE jsonb_build_object(
      'user',
      (
        SELECT jsonb_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'phone', u.phone,
          'city', u.city,
          'country', u.country,
          'email_verified_at', u.email_verified_at
        )
        FROM public.users u
        WHERE u.id = auth.uid()
      ),
      'recruiter',
      (
        SELECT jsonb_build_object(
          'id', r.id,
          'job_title', r.job_title,
          'bio', r.bio,
          'recruiter_type', r.recruiter_type,
          'specialisations', COALESCE(r.specialisations, '{}'::TEXT[]),
          'industries', COALESCE(r.industries, '{}'::TEXT[]),
          'preferred_work_type_codes', COALESCE(r.preferred_work_type_codes, '{}'::TEXT[]),
          'preferred_experience_levels', COALESCE(r.preferred_experience_levels, '{}'::TEXT[]),
          'remote_preference', r.remote_preference
        )
        FROM public.recruiters r
        WHERE r.user_id = auth.uid()
      ),
      'company',
      (
        SELECT jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'website', c.website,
          'city', c.city,
          'country', c.country,
          'is_verified', c.is_verified,
          'employee_count_range', c.employee_count_range,
          'hires_per_year_range', c.hires_per_year_range
        )
        FROM public.recruiters r
        INNER JOIN public.companies c ON c.id = r.company_id
        WHERE r.user_id = auth.uid()
      )
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION public.get_own_recruiter_profile() TO authenticated;
