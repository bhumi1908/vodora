-- Candidate education records linked via candidate_id (public.candidates.id).

-- ---------------------------------------------------------------------------
-- Table — candidate_education
-- ---------------------------------------------------------------------------

CREATE TABLE public.candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  degree_or_class VARCHAR(255) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candidate_education_dates_check CHECK (
    start_date IS NULL
    OR end_date IS NULL
    OR end_date >= start_date
  )
);

CREATE TRIGGER candidate_education_set_updated_at
  BEFORE UPDATE ON public.candidate_education
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX candidate_education_candidate_id_idx
  ON public.candidate_education (candidate_id);

CREATE INDEX candidate_education_candidate_id_sort_order_idx
  ON public.candidate_education (candidate_id, sort_order);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY candidate_education_select_own ON public.candidate_education
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_education_insert_own ON public.candidate_education
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_education_update_own ON public.candidate_education
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY candidate_education_delete_own ON public.candidate_education
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = candidate_education.candidate_id
        AND c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_education TO authenticated;
