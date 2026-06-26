-- Public contact form submissions (inserted via service role from API).

CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (
    subject IN ('general', 'candidate', 'recruiter', 'enterprise', 'press')
  ),
  message TEXT NOT NULL,
  client_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contact_submissions_created_at_idx
  ON public.contact_submissions (created_at DESC);

CREATE INDEX contact_submissions_email_idx
  ON public.contact_submissions (email);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
