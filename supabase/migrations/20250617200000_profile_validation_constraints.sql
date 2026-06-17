-- Profile validation: 5 MB file limit, no future employment/education dates.

UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'candidate-files';

ALTER TABLE public.employment_history
  DROP CONSTRAINT IF EXISTS employment_history_start_date_not_future;

ALTER TABLE public.employment_history
  ADD CONSTRAINT employment_history_start_date_not_future
  CHECK (
    start_date <= (
      date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'
    )::date
  );

ALTER TABLE public.employment_history
  DROP CONSTRAINT IF EXISTS employment_history_end_date_not_future;

ALTER TABLE public.employment_history
  ADD CONSTRAINT employment_history_end_date_not_future
  CHECK (
    end_date IS NULL
    OR end_date <= (
      date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'
    )::date
  );

ALTER TABLE public.candidate_education
  DROP CONSTRAINT IF EXISTS candidate_education_start_date_not_future;

ALTER TABLE public.candidate_education
  ADD CONSTRAINT candidate_education_start_date_not_future
  CHECK (
    start_date IS NULL
    OR start_date <= (
      date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'
    )::date
  );

ALTER TABLE public.candidate_education
  DROP CONSTRAINT IF EXISTS candidate_education_end_date_not_future;

ALTER TABLE public.candidate_education
  ADD CONSTRAINT candidate_education_end_date_not_future
  CHECK (
    end_date IS NULL
    OR end_date <= (
      date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'
    )::date
  );

ALTER TABLE public.candidate_documents
  DROP CONSTRAINT IF EXISTS candidate_documents_file_size_bytes_check;

ALTER TABLE public.candidate_documents
  ADD CONSTRAINT candidate_documents_file_size_bytes_check
  CHECK (
    file_size_bytes IS NULL
    OR (file_size_bytes > 0 AND file_size_bytes <= 5242880)
  );
