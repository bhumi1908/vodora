-- Include job_title_id in get_own_candidate_profile for profile edit.

CREATE OR REPLACE FUNCTION public.get_own_candidate_profile()
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
          'country', u.country
        )
        FROM public.users u
        WHERE u.id = auth.uid()
      ),
      'candidate',
      (
        SELECT jsonb_build_object(
          'id', c.id,
          'vodora_id', c.vodora_id,
          'profession', c.profession,
          'job_title_id', c.job_title_id,
          'current_position', c.current_position,
          'current_company_name', c.current_company_name,
          'headline', c.headline,
          'summary', c.summary,
          'city', c.city,
          'country', c.country,
          'linkedin_profile_url', c.linkedin_profile_url,
          'profile_picture_url', c.profile_picture_url,
          'availability_status', c.availability_status,
          'availability_start', c.availability_start,
          'experience_level', c.experience_level,
          'total_years_experience', c.total_years_experience,
          'spotlight_blocks', c.spotlight_blocks
        )
        FROM public.candidates c
        WHERE c.user_id = auth.uid()
      ),
      'skills',
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cs.id,
              'skill_name', cs.skill_name,
              'proficiency', cs.proficiency,
              'years_experience', cs.years_experience
            )
            ORDER BY cs.skill_name
          )
          FROM public.candidate_skills cs
          INNER JOIN public.candidates c ON c.id = cs.candidate_id
          WHERE c.user_id = auth.uid()
        ),
        '[]'::jsonb
      ),
      'employment',
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', eh.id,
              'job_title', eh.job_title,
              'company_name', eh.company_name,
              'location', eh.location,
              'start_date', eh.start_date,
              'end_date', eh.end_date,
              'is_current', eh.is_current,
              'description', eh.description,
              'sort_order', eh.sort_order
            )
            ORDER BY eh.sort_order, eh.start_date DESC
          )
          FROM public.employment_history eh
          INNER JOIN public.candidates c ON c.id = eh.candidate_id
          WHERE c.user_id = auth.uid()
        ),
        '[]'::jsonb
      ),
      'education',
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', ce.id,
              'degree_or_class', ce.degree_or_class,
              'institution_name', ce.institution_name,
              'start_date', ce.start_date,
              'end_date', ce.end_date,
              'description', ce.description,
              'sort_order', ce.sort_order
            )
            ORDER BY ce.sort_order, ce.start_date DESC
          )
          FROM public.candidate_education ce
          INNER JOIN public.candidates c ON c.id = ce.candidate_id
          WHERE c.user_id = auth.uid()
        ),
        '[]'::jsonb
      ),
      'documents',
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cd.id,
              'document_type', cd.document_type,
              'file_name', cd.file_name,
              'file_url', cd.file_url,
              'uploaded_at', cd.uploaded_at,
              'is_primary', cd.is_primary
            )
            ORDER BY cd.uploaded_at DESC
          )
          FROM public.candidate_documents cd
          INNER JOIN public.candidates c ON c.id = cd.candidate_id
          WHERE c.user_id = auth.uid()
        ),
        '[]'::jsonb
      )
    )
  END;
$$;
