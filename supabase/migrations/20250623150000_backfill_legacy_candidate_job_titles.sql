-- Backfill legacy candidates that have no structured job title.
-- Safe to run multiple times: only updates rows where job_title_id IS NULL.
--
-- Default title: Administrator (Administration & Office Support)
-- To use another title, change the job title name in the lookup below.

DO $$
DECLARE
  v_job_title_id UUID;
  v_profession TEXT;
  v_industry_category_id UUID;
  v_updated_count INTEGER;
BEGIN
  SELECT
    jt.id,
    jt.name,
    jc.industry_category_id
  INTO
    v_job_title_id,
    v_profession,
    v_industry_category_id
  FROM public.job_titles jt
  JOIN public.job_subcategories js ON js.id = jt.subcategory_id
  JOIN public.job_categories jc ON jc.id = js.category_id
  WHERE jt.name = 'Administrator'
    AND jt.is_active = TRUE
    AND js.is_active = TRUE
    AND jc.is_active = TRUE
  LIMIT 1;

  IF v_job_title_id IS NULL THEN
    RAISE EXCEPTION 'Default job title "Administrator" was not found. Seed job titles first.';
  END IF;

  IF v_industry_category_id IS NULL THEN
    RAISE EXCEPTION 'Default job title has no industry category mapping.';
  END IF;

  UPDATE public.candidates
  SET
    job_title_id = v_job_title_id,
    profession = v_profession,
    industry_category_id = v_industry_category_id
  WHERE job_title_id IS NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % legacy candidate(s) with job title "%".', v_updated_count, v_profession;
END;
$$;
