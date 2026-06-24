-- Reference collection: recruiter lookup of verified candidate details by candidate id.
-- Uses SECURITY DEFINER so recruiters are not blocked by candidates/users RLS.

CREATE OR REPLACE FUNCTION public.get_reference_collection_candidate_details(
  p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiters r
    WHERE r.user_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'candidate_id', c.id,
      'vodora_id', c.vodora_id,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'email', u.email,
      'title', COALESCE(
        NULLIF(btrim(c.current_position), ''),
        NULLIF(btrim(c.headline), ''),
        NULLIF(btrim(c.profession), '')
      ),
      'company', NULLIF(btrim(c.current_company_name), '')
    )
    FROM public.candidates c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.id = p_candidate_id
      AND c.visibility IN ('recruiters_only', 'public')
      AND u.is_active = TRUE
      AND u.email_verified_at IS NOT NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_reference_collection_candidate_details(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reference_collection_candidate_details(UUID) TO authenticated;
