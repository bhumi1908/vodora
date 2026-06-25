import { createAdminClient } from "@/lib/supabase/admin";
import { getRelationshipLabel, getRefereeInitials } from "@/components/profile/reference/types";
import { formatDateRange } from "@/lib/profile/format";

export type ReferenceInvitationDetails = {
  id: string;
  invitationToken: string;
  candidateName: string;
  candidateInitials: string;
  candidateTitle: string | null;
  candidateCompany: string | null;
  employmentPeriod: string | null;
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
  refereeEmail: string;
  refereePhone: string | null;
  relationship: string;
  relationshipLabel: string;
  employmentStart: string | null;
  employmentEnd: string | null;
  referenceType: string;
  candidateMessage: string | null;
  status: string;
  expiresAt: string;
  isExpired: boolean;
  alreadySubmitted: boolean;
};

export async function fetchReferenceInvitationByToken(
  token: string,
): Promise<{ invitation: ReferenceInvitationDetails | null; error?: string }> {
  const trimmed = token.trim();

  if (!trimmed) {
    return { invitation: null, error: "Invitation token is required." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("reference_requests")
    .select(
      `
      id,
      invitation_token,
      candidate_id,
      employment_history_id,
      referee_name,
      referee_title,
      referee_company,
      referee_email,
      referee_phone,
      relationship,
      employment_start,
      employment_end,
      reference_type,
      candidate_message,
      status,
      invitation_expires_at
    `,
    )
    .eq("invitation_token", trimmed)
    .maybeSingle();

  if (error) {
    console.error("fetchReferenceInvitationByToken failed:", error);
    return { invitation: null, error: "Unable to load invitation." };
  }

  if (!data) {
    return { invitation: null, error: "This invitation link is invalid." };
  }

  const { data: candidate } = await admin
    .from("candidates")
    .select("user_id")
    .eq("id", data.candidate_id)
    .maybeSingle();

  let candidateName = "the candidate";
  let candidateTitle: string | null = null;
  let candidateCompany: string | null = null;

  if (candidate?.user_id) {
    const { data: user } = await admin
      .from("users")
      .select("first_name, last_name")
      .eq("id", candidate.user_id)
      .maybeSingle();

    if (user) {
      candidateName = `${user.first_name} ${user.last_name}`.trim();
    }
  }

  if (data.employment_history_id) {
    const { data: employment } = await admin
      .from("employment_history")
      .select("job_title, company_name, start_date, end_date, is_current")
      .eq("id", data.employment_history_id)
      .maybeSingle();

    if (employment) {
      candidateTitle = employment.job_title;
      candidateCompany = employment.company_name;
    }
  }

  if (!candidateTitle || !candidateCompany) {
    const { data: candidateProfile } = await admin
      .from("candidates")
      .select("current_position, headline, profession, current_company_name")
      .eq("id", data.candidate_id)
      .maybeSingle();

    if (candidateProfile) {
      candidateTitle =
        candidateTitle ??
        candidateProfile.current_position?.trim() ??
        candidateProfile.headline?.trim() ??
        candidateProfile.profession?.trim() ??
        null;
      candidateCompany =
        candidateCompany ?? candidateProfile.current_company_name?.trim() ?? null;
    }
  }

  const employmentPeriod =
    data.employment_start || data.employment_end
      ? formatDateRange(data.employment_start, data.employment_end)
      : null;

  const isExpired =
    data.status === "expired" ||
    new Date(data.invitation_expires_at).getTime() < Date.now();

  const alreadySubmitted = ["submitted", "verified", "rejected"].includes(
    data.status,
  );

  return {
    invitation: {
      id: data.id,
      invitationToken: data.invitation_token,
      candidateName,
      candidateInitials: getRefereeInitials(candidateName),
      candidateTitle,
      candidateCompany,
      employmentPeriod,
      refereeName: data.referee_name,
      refereeTitle: data.referee_title,
      refereeCompany: data.referee_company,
      refereeEmail: data.referee_email,
      refereePhone: data.referee_phone,
      relationship: data.relationship,
      relationshipLabel: getRelationshipLabel(data.relationship),
      employmentStart: data.employment_start,
      employmentEnd: data.employment_end,
      referenceType: data.reference_type,
      candidateMessage: data.candidate_message,
      status: data.status,
      expiresAt: data.invitation_expires_at,
      isExpired,
      alreadySubmitted,
    },
  };
}
