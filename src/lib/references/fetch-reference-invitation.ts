import { createAdminClient } from "@/lib/supabase/admin";
import { getRelationshipLabel } from "@/components/profile/reference/types";

export type ReferenceInvitationDetails = {
  id: string;
  invitationToken: string;
  candidateName: string;
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
  refereeEmail: string;
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
      referee_name,
      referee_title,
      referee_company,
      referee_email,
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
      refereeName: data.referee_name,
      refereeTitle: data.referee_title,
      refereeCompany: data.referee_company,
      refereeEmail: data.referee_email,
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
