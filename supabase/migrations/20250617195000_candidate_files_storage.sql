-- Supabase Storage bucket for candidate profile files (resume, letters, photos).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-files',
  'candidate-files',
  TRUE,
  5242880,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::TEXT[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY candidate_files_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidate-files'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY candidate_files_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'candidate-files'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY candidate_files_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'candidate-files'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'candidate-files'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY candidate_files_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'candidate-files'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Public read for shared profile assets stored in the bucket.
CREATE POLICY candidate_files_public_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'candidate-files');
