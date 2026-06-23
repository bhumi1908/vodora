-- Ensure anonymous and authenticated users can read active job title lookup data.
-- Matches industry_categories / work_types public read policies.

DROP POLICY IF EXISTS job_categories_select_active ON public.job_categories;
DROP POLICY IF EXISTS job_subcategories_select_active ON public.job_subcategories;
DROP POLICY IF EXISTS job_titles_select_active ON public.job_titles;

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
