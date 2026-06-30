-- Verified references should always carry a verification timestamp for the stamp UI.

UPDATE public.reference_requests
SET verified_at = COALESCE(submitted_at, updated_at, created_at)
WHERE status = 'verified'
  AND verified_at IS NULL;
