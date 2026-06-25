-- Reference response: digital signature, profile opt-in, and referee LinkedIn.

ALTER TABLE public.reference_responses
  ADD COLUMN IF NOT EXISTS signature_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS signature_date DATE,
  ADD COLUMN IF NOT EXISTS allow_profile_creation BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referee_linkedin VARCHAR(500);

ALTER TABLE public.reference_responses
  ADD CONSTRAINT reference_responses_signature_name_length_check CHECK (
    signature_name IS NULL OR char_length(btrim(signature_name)) <= 200
  ),
  ADD CONSTRAINT reference_responses_referee_linkedin_length_check CHECK (
    referee_linkedin IS NULL OR char_length(referee_linkedin) <= 500
  );
