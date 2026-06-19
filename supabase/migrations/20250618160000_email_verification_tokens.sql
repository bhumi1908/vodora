-- Email verification tokens for custom SendGrid signup flow (not Supabase email)

CREATE TABLE public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX email_verification_tokens_user_id_idx
  ON public.email_verification_tokens (user_id);

CREATE INDEX email_verification_tokens_expires_at_idx
  ON public.email_verification_tokens (expires_at);

ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- No policies: only service role (bypasses RLS) can access this table.
