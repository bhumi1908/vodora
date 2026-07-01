-- Job posting expiry: hide expired posts from candidates, default listing duration on publish.

CREATE OR REPLACE FUNCTION public.job_posting_is_active(
  p_status TEXT,
  p_closes_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    p_status = 'published'
    AND (p_closes_at IS NULL OR p_closes_at > now());
$$;

CREATE OR REPLACE FUNCTION public.set_job_posting_closes_at_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published'
    AND NEW.closes_at IS NULL
    AND (
      TG_OP = 'INSERT'
      OR OLD.status IS DISTINCT FROM 'published'
    ) THEN
    NEW.closes_at := COALESCE(NEW.published_at, now()) + INTERVAL '30 days';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS job_postings_set_closes_at_on_publish ON public.job_postings;

CREATE TRIGGER job_postings_set_closes_at_on_publish
  BEFORE INSERT OR UPDATE OF status, closes_at, published_at ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_posting_closes_at_on_publish();

DROP POLICY IF EXISTS job_postings_select ON public.job_postings;

CREATE POLICY job_postings_select ON public.job_postings
  FOR SELECT TO authenticated
  USING (
    public.is_own_recruiter(recruiter_id)
    OR public.job_posting_is_active(status, closes_at)
  );

GRANT EXECUTE ON FUNCTION public.job_posting_is_active(TEXT, TIMESTAMPTZ) TO authenticated;
