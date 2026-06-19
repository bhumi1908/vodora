-- Recruiter profile edit: specialisations, industries, and extended company fields in RPC.

ALTER TABLE public.recruiters
  ADD COLUMN IF NOT EXISTS specialisations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS industries TEXT[] NOT NULL DEFAULT '{}';

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
          'industries', COALESCE(r.industries, '{}'::TEXT[])
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
