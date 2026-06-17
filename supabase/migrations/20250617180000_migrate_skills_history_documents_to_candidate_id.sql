-- Migrate candidate_skills, employment_history, and candidate_documents
-- from user_id (public.users) to candidate_id (public.candidates).

-- ---------------------------------------------------------------------------
-- Drop RLS policies (they reference user_id)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS candidate_skills_select_own ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_insert_own ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_update_own ON public.candidate_skills;
DROP POLICY IF EXISTS candidate_skills_delete_own ON public.candidate_skills;

DROP POLICY IF EXISTS employment_history_select_own ON public.employment_history;
DROP POLICY IF EXISTS employment_history_insert_own ON public.employment_history;
DROP POLICY IF EXISTS employment_history_update_own ON public.employment_history;
DROP POLICY IF EXISTS employment_history_delete_own ON public.employment_history;

DROP POLICY IF EXISTS candidate_documents_select_own ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_insert_own ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_update_own ON public.candidate_documents;
DROP POLICY IF EXISTS candidate_documents_delete_own ON public.candidate_documents;

-- ---------------------------------------------------------------------------
-- candidate_skills: user_id → candidate_id
-- ---------------------------------------------------------------------------

ALTER TABLE public.candidate_skills
  ADD COLUMN IF NOT EXISTS candidate_id UUID;

UPDATE public.candidate_skills cs
SET candidate_id = c.id
FROM public.candidates c
WHERE c.user_id = cs.user_id
  AND cs.candidate_id IS NULL;

DELETE FROM public.candidate_skills WHERE candidate_id IS NULL;

ALTER TABLE public.candidate_skills
  DROP CONSTRAINT IF EXISTS candidate_skills_user_id_skill_name_key;

DROP INDEX IF EXISTS public.candidate_skills_user_id_idx;

ALTER TABLE public.candidate_skills
  DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.candidate_skills
  ALTER COLUMN candidate_id SET NOT NULL;

ALTER TABLE public.candidate_skills
  DROP CONSTRAINT IF EXISTS candidate_skills_candidate_id_fkey;

ALTER TABLE public.candidate_skills
  ADD CONSTRAINT candidate_skills_candidate_id_fkey
  FOREIGN KEY (candidate_id) REFERENCES public.candidates (id) ON DELETE CASCADE;

ALTER TABLE public.candidate_skills
  DROP CONSTRAINT IF EXISTS candidate_skills_candidate_id_skill_name_key;

ALTER TABLE public.candidate_skills
  ADD CONSTRAINT candidate_skills_candidate_id_skill_name_key
  UNIQUE (candidate_id, skill_name);

CREATE INDEX IF NOT EXISTS candidate_skills_candidate_id_idx
  ON public.candidate_skills (candidate_id);

-- ---------------------------------------------------------------------------
-- employment_history: user_id → candidate_id
-- ---------------------------------------------------------------------------

ALTER TABLE public.employment_history
  ADD COLUMN IF NOT EXISTS candidate_id UUID;

UPDATE public.employment_history eh
SET candidate_id = c.id
FROM public.candidates c
WHERE c.user_id = eh.user_id
  AND eh.candidate_id IS NULL;

DELETE FROM public.employment_history WHERE candidate_id IS NULL;

DROP INDEX IF EXISTS public.employment_history_user_id_idx;
DROP INDEX IF EXISTS public.employment_history_user_id_sort_order_idx;

ALTER TABLE public.employment_history
  DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.employment_history
  ALTER COLUMN candidate_id SET NOT NULL;

ALTER TABLE public.employment_history
  DROP CONSTRAINT IF EXISTS employment_history_candidate_id_fkey;

ALTER TABLE public.employment_history
  ADD CONSTRAINT employment_history_candidate_id_fkey
  FOREIGN KEY (candidate_id) REFERENCES public.candidates (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS employment_history_candidate_id_idx
  ON public.employment_history (candidate_id);

CREATE INDEX IF NOT EXISTS employment_history_candidate_id_sort_order_idx
  ON public.employment_history (candidate_id, sort_order);

-- ---------------------------------------------------------------------------
-- candidate_documents: user_id → candidate_id
-- ---------------------------------------------------------------------------

ALTER TABLE public.candidate_documents
  ADD COLUMN IF NOT EXISTS candidate_id UUID;

UPDATE public.candidate_documents cd
SET candidate_id = c.id
FROM public.candidates c
WHERE c.user_id = cd.user_id
  AND cd.candidate_id IS NULL;

DELETE FROM public.candidate_documents WHERE candidate_id IS NULL;

DROP INDEX IF EXISTS public.candidate_documents_user_id_idx;
DROP INDEX IF EXISTS public.candidate_documents_user_id_document_type_idx;
DROP INDEX IF EXISTS public.candidate_documents_one_primary_per_type_idx;

ALTER TABLE public.candidate_documents
  DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.candidate_documents
  ALTER COLUMN candidate_id SET NOT NULL;

ALTER TABLE public.candidate_documents
  DROP CONSTRAINT IF EXISTS candidate_documents_candidate_id_fkey;

ALTER TABLE public.candidate_documents
  ADD CONSTRAINT candidate_documents_candidate_id_fkey
  FOREIGN KEY (candidate_id) REFERENCES public.candidates (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS candidate_documents_candidate_id_idx
  ON public.candidate_documents (candidate_id);

CREATE INDEX IF NOT EXISTS candidate_documents_candidate_id_document_type_idx
  ON public.candidate_documents (candidate_id, document_type);

CREATE UNIQUE INDEX IF NOT EXISTS candidate_documents_one_primary_per_type_idx
  ON public.candidate_documents (candidate_id, document_type)
  WHERE is_primary = TRUE;

-- ---------------------------------------------------------------------------
-- RLS policies (candidate_id via candidates.user_id = auth.uid())
-- ---------------------------------------------------------------------------

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
