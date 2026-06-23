-- Reference Passport: candidate-controlled, admin-verified employment references.
-- Phase 1 schema only — no changes to existing search RPCs (reference_count stays 0 until phase 2).

-- ---------------------------------------------------------------------------
-- Platform admin helper (role exists in schema but was not seeded)
-- ---------------------------------------------------------------------------

INSERT INTO public.roles (name, description)
VALUES ('admin', 'Vodora platform administrator')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.auth_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(btrim(u.email))
  FROM public.users u
  WHERE u.id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.auth_user_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_email() TO authenticated;

-- ---------------------------------------------------------------------------
-- Table — reference_requests
-- ---------------------------------------------------------------------------

CREATE TABLE public.reference_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  employment_history_id UUID REFERENCES public.employment_history (id) ON DELETE SET NULL,
  requested_by_type VARCHAR(20) NOT NULL,
  requested_by_user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  requested_by_recruiter_id UUID REFERENCES public.recruiters (id) ON DELETE SET NULL,
  referee_name VARCHAR(200) NOT NULL,
  referee_title VARCHAR(200) NOT NULL,
  referee_company VARCHAR(255) NOT NULL,
  referee_email VARCHAR(255) NOT NULL,
  referee_phone VARCHAR(20),
  relationship VARCHAR(50) NOT NULL,
  employment_start DATE,
  employment_end DATE,
  reference_type VARCHAR(30) NOT NULL DEFAULT 'written',
  candidate_message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  invitation_sent_at TIMESTAMPTZ,
  invitation_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  referee_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reference_requests_requested_by_type_check CHECK (
    requested_by_type IN ('candidate', 'recruiter')
  ),
  CONSTRAINT reference_requests_relationship_check CHECK (
    relationship IN (
      'direct_manager',
      'former_supervisor',
      'colleague',
      'mentor',
      'client',
      'other'
    )
  ),
  CONSTRAINT reference_requests_reference_type_check CHECK (
    reference_type IN ('written', 'questionnaire', 'rating', 'video')
  ),
  CONSTRAINT reference_requests_status_check CHECK (
    status IN (
      'pending',
      'submitted',
      'verified',
      'rejected',
      'expired',
      'cancelled'
    )
  ),
  CONSTRAINT reference_requests_referee_name_check CHECK (
    char_length(btrim(referee_name)) >= 2
  ),
  CONSTRAINT reference_requests_referee_title_check CHECK (
    char_length(btrim(referee_title)) >= 1
  ),
  CONSTRAINT reference_requests_referee_company_check CHECK (
    char_length(btrim(referee_company)) >= 1
  ),
  CONSTRAINT reference_requests_referee_email_check CHECK (
    char_length(btrim(referee_email)) >= 3
    AND referee_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  ),
  CONSTRAINT reference_requests_employment_dates_check CHECK (
    employment_end IS NULL
    OR employment_start IS NULL
    OR employment_end >= employment_start
  ),
  CONSTRAINT reference_requests_candidate_message_length_check CHECK (
    candidate_message IS NULL OR char_length(candidate_message) <= 2000
  ),
  CONSTRAINT reference_requests_rejection_reason_length_check CHECK (
    rejection_reason IS NULL OR char_length(rejection_reason) <= 2000
  ),
  CONSTRAINT reference_requests_requested_by_recruiter_check CHECK (
    (
      requested_by_type = 'recruiter'
      AND requested_by_recruiter_id IS NOT NULL
    )
    OR (
      requested_by_type = 'candidate'
      AND requested_by_recruiter_id IS NULL
    )
  )
);

CREATE TRIGGER reference_requests_set_updated_at
  BEFORE UPDATE ON public.reference_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX reference_requests_invitation_token_idx
  ON public.reference_requests (invitation_token);

CREATE INDEX reference_requests_candidate_id_idx
  ON public.reference_requests (candidate_id);

CREATE INDEX reference_requests_referee_email_lower_idx
  ON public.reference_requests (lower(referee_email));

CREATE INDEX reference_requests_referee_user_id_idx
  ON public.reference_requests (referee_user_id)
  WHERE referee_user_id IS NOT NULL;

CREATE INDEX reference_requests_status_idx
  ON public.reference_requests (status);

CREATE INDEX reference_requests_admin_queue_idx
  ON public.reference_requests (status, submitted_at DESC)
  WHERE status = 'submitted';

CREATE UNIQUE INDEX reference_requests_active_invitation_idx
  ON public.reference_requests (candidate_id, lower(referee_email))
  WHERE status IN ('pending', 'submitted');

CREATE OR REPLACE FUNCTION public.count_verified_references(p_candidate_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.reference_requests rr
  WHERE rr.candidate_id = p_candidate_id
    AND rr.status = 'verified';
$$;

REVOKE ALL ON FUNCTION public.count_verified_references(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_verified_references(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Table — reference_responses (one per request)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reference_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_request_id UUID NOT NULL UNIQUE REFERENCES public.reference_requests (id) ON DELETE CASCADE,
  submitted_by_user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  employment_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  position_held VARCHAR(255),
  employment_dates_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  performance_rating SMALLINT,
  reliability_rating SMALLINT,
  teamwork_rating SMALLINT,
  leadership_rating SMALLINT,
  rehire_recommendation BOOLEAN,
  written_comments TEXT,
  questionnaire_responses JSONB,
  attestation_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reference_responses_performance_rating_check CHECK (
    performance_rating IS NULL
    OR performance_rating BETWEEN 1 AND 5
  ),
  CONSTRAINT reference_responses_reliability_rating_check CHECK (
    reliability_rating IS NULL
    OR reliability_rating BETWEEN 1 AND 5
  ),
  CONSTRAINT reference_responses_teamwork_rating_check CHECK (
    teamwork_rating IS NULL
    OR teamwork_rating BETWEEN 1 AND 5
  ),
  CONSTRAINT reference_responses_leadership_rating_check CHECK (
    leadership_rating IS NULL
    OR leadership_rating BETWEEN 1 AND 5
  ),
  CONSTRAINT reference_responses_written_comments_length_check CHECK (
    written_comments IS NULL OR char_length(written_comments) <= 5000
  ),
  CONSTRAINT reference_responses_attestation_required_check CHECK (
    attestation_confirmed = TRUE
  )
);

CREATE INDEX reference_responses_submitted_by_user_id_idx
  ON public.reference_responses (submitted_by_user_id);

-- ---------------------------------------------------------------------------
-- Table — reference_verifications (audit trail; admin review is primary path)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reference_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_request_id UUID NOT NULL REFERENCES public.reference_requests (id) ON DELETE CASCADE,
  method VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verified_by_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reference_verifications_method_check CHECK (
    method IN ('admin', 'email_domain', 'linkedin', 'company')
  ),
  CONSTRAINT reference_verifications_status_check CHECK (
    status IN ('pending', 'passed', 'failed')
  ),
  CONSTRAINT reference_verifications_notes_length_check CHECK (
    notes IS NULL OR char_length(notes) <= 2000
  )
);

CREATE INDEX reference_verifications_reference_request_id_idx
  ON public.reference_verifications (reference_request_id);

CREATE INDEX reference_verifications_status_idx
  ON public.reference_verifications (status, created_at DESC);

-- ---------------------------------------------------------------------------
-- Table — reference_passport_shares (recruiter access via secure link only)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reference_passport_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  share_token UUID NOT NULL DEFAULT gen_random_uuid(),
  share_type VARCHAR(30) NOT NULL,
  included_reference_ids UUID[] NOT NULL DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reference_passport_shares_share_type_check CHECK (
    share_type IN ('full_passport', 'selected_references')
  ),
  CONSTRAINT reference_passport_shares_view_count_check CHECK (
    view_count >= 0
  )
);

CREATE TRIGGER reference_passport_shares_set_updated_at
  BEFORE UPDATE ON public.reference_passport_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX reference_passport_shares_share_token_idx
  ON public.reference_passport_shares (share_token);

CREATE INDEX reference_passport_shares_candidate_id_idx
  ON public.reference_passport_shares (candidate_id);

CREATE INDEX reference_passport_shares_active_idx
  ON public.reference_passport_shares (candidate_id, is_active)
  WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- Table — reference_share_views (audit when recruiters open share links)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reference_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.reference_passport_shares (id) ON DELETE CASCADE,
  viewer_user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reference_share_views_share_id_idx
  ON public.reference_share_views (share_id);

CREATE INDEX reference_share_views_viewer_user_id_idx
  ON public.reference_share_views (viewer_user_id);

-- ---------------------------------------------------------------------------
-- Triggers — submission lifecycle
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_reference_response_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reference_requests rr
  SET
    status = 'submitted',
    submitted_at = COALESCE(rr.submitted_at, NEW.submitted_at),
    referee_user_id = COALESCE(rr.referee_user_id, NEW.submitted_by_user_id),
    updated_at = now()
  WHERE rr.id = NEW.reference_request_id
    AND rr.status = 'pending'
    AND rr.invitation_expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reference request is not open for submission';
  END IF;

  INSERT INTO public.reference_verifications (
    reference_request_id,
    method,
    status
  )
  VALUES (
    NEW.reference_request_id,
    'admin',
    'pending'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER reference_responses_after_insert
  AFTER INSERT ON public.reference_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reference_response_insert();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.reference_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_passport_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_share_views ENABLE ROW LEVEL SECURITY;

-- reference_requests: candidate owner
CREATE POLICY reference_requests_select_candidate ON public.reference_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_requests.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_requests_insert_candidate ON public.reference_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requested_by_type = 'candidate'
    AND requested_by_user_id = auth.uid()
    AND requested_by_recruiter_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_requests.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_requests_update_candidate ON public.reference_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_requests.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_requests.candidate_id
        AND c.user_id = auth.uid()
    )
  );

-- reference_requests: recruiter may request on behalf of a candidate
CREATE POLICY reference_requests_insert_recruiter ON public.reference_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requested_by_type = 'recruiter'
    AND requested_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.id = reference_requests.requested_by_recruiter_id
        AND r.user_id = auth.uid()
    )
  );

-- reference_requests: invited referee (candidate account) can read open requests
CREATE POLICY reference_requests_select_referee ON public.reference_requests
  FOR SELECT TO authenticated
  USING (
    lower(reference_requests.referee_email) = public.auth_user_email()
  );

-- reference_requests: platform admin
CREATE POLICY reference_requests_select_admin ON public.reference_requests
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY reference_requests_update_admin ON public.reference_requests
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- reference_responses: candidate reads responses on own requests
CREATE POLICY reference_responses_select_candidate ON public.reference_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.reference_requests rr
      INNER JOIN public.candidates c ON c.id = rr.candidate_id
      WHERE rr.id = reference_responses.reference_request_id
        AND c.user_id = auth.uid()
    )
  );

-- reference_responses: referee submits for matching invitation
CREATE POLICY reference_responses_select_referee ON public.reference_responses
  FOR SELECT TO authenticated
  USING (submitted_by_user_id = auth.uid());

CREATE POLICY reference_responses_insert_referee ON public.reference_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.reference_requests rr
      WHERE rr.id = reference_responses.reference_request_id
        AND rr.status = 'pending'
        AND rr.invitation_expires_at > now()
        AND lower(rr.referee_email) = public.auth_user_email()
    )
  );

CREATE POLICY reference_responses_select_admin ON public.reference_responses
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

-- reference_verifications: candidate sees verification on own references
CREATE POLICY reference_verifications_select_candidate ON public.reference_verifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.reference_requests rr
      INNER JOIN public.candidates c ON c.id = rr.candidate_id
      WHERE rr.id = reference_verifications.reference_request_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_verifications_admin_all ON public.reference_verifications
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- reference_passport_shares: candidate manages own share links
CREATE POLICY reference_passport_shares_select_candidate ON public.reference_passport_shares
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_passport_shares.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_passport_shares_insert_candidate ON public.reference_passport_shares
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_passport_shares.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_passport_shares_update_candidate ON public.reference_passport_shares
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_passport_shares.candidate_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_passport_shares.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_passport_shares_delete_candidate ON public.reference_passport_shares
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.candidates c
      WHERE c.id = reference_passport_shares.candidate_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY reference_passport_shares_select_admin ON public.reference_passport_shares
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

-- reference_share_views: recruiters record views (share-link RPC will validate token in phase 2)
CREATE POLICY reference_share_views_insert_recruiter ON public.reference_share_views
  FOR INSERT TO authenticated
  WITH CHECK (
    viewer_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.recruiters r
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY reference_share_views_select_own ON public.reference_share_views
  FOR SELECT TO authenticated
  USING (
    viewer_user_id = auth.uid()
    OR public.is_platform_admin()
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON public.reference_requests TO authenticated;
GRANT SELECT, INSERT ON public.reference_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reference_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reference_passport_shares TO authenticated;
GRANT SELECT, INSERT ON public.reference_share_views TO authenticated;
