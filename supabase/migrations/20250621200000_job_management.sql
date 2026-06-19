-- Job management: recruiters post jobs, candidates apply.
-- Aligns with candidate job board UI (title, category, work type, salary, etc.).

-- ---------------------------------------------------------------------------
-- Table — job_postings
-- ---------------------------------------------------------------------------

CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters (id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies (id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  company_display_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  work_type_id UUID NOT NULL REFERENCES public.work_types (id) ON DELETE RESTRICT,
  salary_display VARCHAR(100),
  description TEXT NOT NULL,
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_postings_title_check CHECK (
    char_length(btrim(title)) >= 2
  ),
  CONSTRAINT job_postings_company_display_name_check CHECK (
    char_length(btrim(company_display_name)) >= 1
  ),
  CONSTRAINT job_postings_category_check CHECK (
    category IN (
      'Technology',
      'Product',
      'Design',
      'Accounting & Finance',
      'Healthcare',
      'Engineering',
      'Marketing',
      'Human Resources',
      'Trades & Services'
    )
  ),
  CONSTRAINT job_postings_status_check CHECK (
    status IN ('draft', 'published', 'closed', 'archived')
  ),
  CONSTRAINT job_postings_closes_at_check CHECK (
    closes_at IS NULL OR published_at IS NULL OR closes_at >= published_at
  )
);

CREATE TRIGGER job_postings_set_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_job_posting_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published'
    AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at := COALESCE(NEW.published_at, now());
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER job_postings_set_published_at
  BEFORE INSERT OR UPDATE OF status ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_posting_published_at();

CREATE INDEX job_postings_recruiter_id_idx
  ON public.job_postings (recruiter_id);

CREATE INDEX job_postings_company_id_idx
  ON public.job_postings (company_id);

CREATE INDEX job_postings_work_type_id_idx
  ON public.job_postings (work_type_id);

CREATE INDEX job_postings_status_published_at_idx
  ON public.job_postings (status, published_at DESC)
  WHERE status = 'published';

CREATE INDEX job_postings_category_idx
  ON public.job_postings (category);

-- ---------------------------------------------------------------------------
-- Table — job_applications
-- ---------------------------------------------------------------------------

CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES public.job_postings (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'applied',
  cover_letter TEXT,
  resume_document_id UUID REFERENCES public.candidate_documents (id) ON DELETE SET NULL,
  cover_letter_document_id UUID REFERENCES public.candidate_documents (id) ON DELETE SET NULL,
  references_attached BOOLEAN NOT NULL DEFAULT TRUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_job_posting_id_candidate_id_key
    UNIQUE (job_posting_id, candidate_id),
  CONSTRAINT job_applications_status_check CHECK (
    status IN (
      'applied',
      'shortlisted',
      'interview',
      'offer',
      'unsuccessful'
    )
  )
);

CREATE TRIGGER job_applications_set_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX job_applications_job_posting_id_idx
  ON public.job_applications (job_posting_id);

CREATE INDEX job_applications_candidate_id_idx
  ON public.job_applications (candidate_id);

CREATE INDEX job_applications_status_idx
  ON public.job_applications (status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Recruiters manage their own postings; authenticated users can browse published jobs.
CREATE POLICY job_postings_select ON public.job_postings
  FOR SELECT TO authenticated
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = job_postings.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY job_postings_insert_own ON public.job_postings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = job_postings.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY job_postings_update_own ON public.job_postings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = job_postings.recruiter_id
        AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = job_postings.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY job_postings_delete_own ON public.job_postings
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = job_postings.recruiter_id
        AND r.user_id = auth.uid()
    )
  );

-- Candidates apply once per job; recruiters review applications on their postings.
CREATE POLICY job_applications_select_own ON public.job_applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = job_applications.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY job_applications_select_recruiter ON public.job_applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.job_postings jp
      INNER JOIN public.recruiters r ON r.id = jp.recruiter_id
      WHERE jp.id = job_applications.job_posting_id
        AND r.user_id = auth.uid()
    )
  );

CREATE POLICY job_applications_insert_own ON public.job_applications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = job_applications.candidate_id
        AND c.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.job_postings jp
      WHERE jp.id = job_applications.job_posting_id
        AND jp.status = 'published'
        AND (jp.closes_at IS NULL OR jp.closes_at > now())
    )
    AND (
      resume_document_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.candidate_documents cd
        WHERE cd.id = job_applications.resume_document_id
          AND cd.candidate_id = job_applications.candidate_id
          AND cd.document_type = 'resume'
      )
    )
    AND (
      cover_letter_document_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.candidate_documents cd
        WHERE cd.id = job_applications.cover_letter_document_id
          AND cd.candidate_id = job_applications.candidate_id
          AND cd.document_type = 'cover_letter'
      )
    )
  );

CREATE POLICY job_applications_update_recruiter ON public.job_applications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.job_postings jp
      INNER JOIN public.recruiters r ON r.id = jp.recruiter_id
      WHERE jp.id = job_applications.job_posting_id
        AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.job_postings jp
      INNER JOIN public.recruiters r ON r.id = jp.recruiter_id
      WHERE jp.id = job_applications.job_posting_id
        AND r.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_postings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.job_applications TO authenticated;
