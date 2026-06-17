-- Candidate profile data: skills, employment history, and document uploads.
-- Linked via candidate_id (public.candidates.id) consistent with candidate_work_types.

-- ---------------------------------------------------------------------------
-- Table — candidate_skills
-- ---------------------------------------------------------------------------

CREATE TABLE public.candidate_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20),
  years_experience SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidate_skills_candidate_id_skill_name_key UNIQUE (candidate_id, skill_name),
  CONSTRAINT candidate_skills_proficiency_check CHECK (
    proficiency IS NULL
    OR proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')
  ),
  CONSTRAINT candidate_skills_years_experience_check CHECK (
    years_experience IS NULL OR years_experience >= 0
  )
);

CREATE INDEX candidate_skills_candidate_id_idx ON public.candidate_skills (candidate_id);

-- ---------------------------------------------------------------------------
-- Table — employment_history
-- ---------------------------------------------------------------------------

CREATE TABLE public.employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT employment_history_dates_check CHECK (
    end_date IS NULL OR end_date >= start_date
  ),
  CONSTRAINT employment_history_current_role_check CHECK (
    is_current = FALSE OR end_date IS NULL
  )
);

CREATE TRIGGER employment_history_set_updated_at
  BEFORE UPDATE ON public.employment_history
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX employment_history_candidate_id_idx ON public.employment_history (candidate_id);
CREATE INDEX employment_history_candidate_id_sort_order_idx
  ON public.employment_history (candidate_id, sort_order);

-- ---------------------------------------------------------------------------
-- Table — candidate_documents (resume, profile photo, and other uploads)
-- ---------------------------------------------------------------------------

CREATE TABLE public.candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  document_type VARCHAR(30) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type VARCHAR(100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidate_documents_document_type_check CHECK (
    document_type IN (
      'resume',
      'profile_photo',
      'cover_letter',
      'certificate',
      'experience_letter',
      'other'
    )
  ),
  CONSTRAINT candidate_documents_file_size_bytes_check CHECK (
    file_size_bytes IS NULL OR file_size_bytes > 0
  )
);

CREATE INDEX candidate_documents_candidate_id_idx ON public.candidate_documents (candidate_id);
CREATE INDEX candidate_documents_candidate_id_document_type_idx
  ON public.candidate_documents (candidate_id, document_type);

-- One primary file per document type (e.g. one primary resume, one primary photo)
CREATE UNIQUE INDEX candidate_documents_one_primary_per_type_idx
  ON public.candidate_documents (candidate_id, document_type)
  WHERE is_primary = TRUE;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

-- candidate_skills
CREATE POLICY candidate_skills_select_own ON public.candidate_skills
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_skills_insert_own ON public.candidate_skills
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_skills_update_own ON public.candidate_skills
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_skills_delete_own ON public.candidate_skills
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_skills.candidate_id
        AND c.user_id = auth.uid()
    )
  );

-- employment_history
CREATE POLICY employment_history_select_own ON public.employment_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = employment_history.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY employment_history_insert_own ON public.employment_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = employment_history.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY employment_history_update_own ON public.employment_history
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = employment_history.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = employment_history.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY employment_history_delete_own ON public.employment_history
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = employment_history.candidate_id
        AND c.user_id = auth.uid()
    )
  );

-- candidate_documents
CREATE POLICY candidate_documents_select_own ON public.candidate_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_documents_insert_own ON public.candidate_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_documents_update_own ON public.candidate_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_documents_delete_own ON public.candidate_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_documents.candidate_id
        AND c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_documents TO authenticated;
