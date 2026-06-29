import { getRelationshipLabel } from "@/components/profile/reference/types";
import { createAdminClient } from "@/lib/supabase/admin";

import type { DeliverReferenceInvitationParams } from "@/lib/references/reference-request-email.types";

type FetchReferenceRequestDeliveryContextResult =
  | {
      success: true;
      params: DeliverReferenceInvitationParams;
      candidateId: string;
      requestedByRecruiterId: string | null;
      invitationSentAt: string | null;
    }
  | {
      success: false;
      error: string;
    };

export async function fetchReferenceRequestDeliveryContext(
  referenceRequestId: string,
  origin: string,
  recruiterEmail?: string | null,
): Promise<FetchReferenceRequestDeliveryContextResult> {
  const admin = createAdminClient();

  const { data: referenceRow, error: referenceError } = await admin
    .from("reference_requests")
    .select(
      `
      id,
      status,
      invitation_token,
      invitation_sent_at,
      referee_email,
      referee_name,
      referee_company,
      relationship,
      candidate_message,
      requested_by_type,
      requested_by_recruiter_id,
      requested_by_user_id,
      candidate_id
    `,
    )
    .eq("id", referenceRequestId)
    .maybeSingle();

  if (referenceError) {
    console.error("fetchReferenceRequestDeliveryContext failed:", referenceError);
    return {
      success: false,
      error: "Unable to load reference request.",
    };
  }

  if (!referenceRow) {
    return {
      success: false,
      error: "Reference request not found.",
    };
  }

  if (referenceRow.status !== "pending") {
    return {
      success: false,
      error: "Only pending reference requests can be resent.",
    };
  }

  const { data: candidateRow, error: candidateError } = await admin
    .from("candidates")
    .select("user_id")
    .eq("id", referenceRow.candidate_id)
    .maybeSingle();

  if (candidateError || !candidateRow?.user_id) {
    console.error(
      "fetchReferenceRequestDeliveryContext candidate lookup failed:",
      candidateError,
    );
    return {
      success: false,
      error: "Unable to load candidate details.",
    };
  }

  const { data: candidateUserRow, error: candidateUserError } = await admin
    .from("users")
    .select("first_name, last_name")
    .eq("id", candidateRow.user_id)
    .maybeSingle();

  if (candidateUserError) {
    console.error(
      "fetchReferenceRequestDeliveryContext candidate user lookup failed:",
      candidateUserError,
    );
    return {
      success: false,
      error: "Unable to load candidate details.",
    };
  }

  const candidateName = candidateUserRow
    ? `${candidateUserRow.first_name} ${candidateUserRow.last_name}`.trim()
    : "the candidate";

  let recruiterName: string | null = null;
  let recruiterCompany: string | null = null;
  let resolvedRecruiterEmail = recruiterEmail?.trim() || null;

  if (referenceRow.requested_by_type === "recruiter") {
    const { data: recruiterUserRow, error: recruiterUserError } = await admin
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", referenceRow.requested_by_user_id)
      .maybeSingle();

    if (recruiterUserError) {
      console.error(
        "fetchReferenceRequestDeliveryContext recruiter user lookup failed:",
        recruiterUserError,
      );
    } else if (recruiterUserRow) {
      recruiterName =
        `${recruiterUserRow.first_name} ${recruiterUserRow.last_name}`.trim() ||
        null;
      resolvedRecruiterEmail =
        resolvedRecruiterEmail || recruiterUserRow.email?.trim() || null;
    }

    if (referenceRow.requested_by_recruiter_id) {
      const { data: recruiterRow } = await admin
        .from("recruiters")
        .select("company_id")
        .eq("id", referenceRow.requested_by_recruiter_id)
        .maybeSingle();

      if (recruiterRow?.company_id) {
        const { data: companyRow } = await admin
          .from("companies")
          .select("name")
          .eq("id", recruiterRow.company_id)
          .maybeSingle();

        recruiterCompany = companyRow?.name ?? null;
      }
    }
  }

  const inviteUrl = `${origin}/reference/respond?token=${referenceRow.invitation_token}`;
  const historyUrl = new URL("/recruiter/profile?tab=history", origin).toString();

  return {
    success: true,
    candidateId: referenceRow.candidate_id,
    requestedByRecruiterId: referenceRow.requested_by_recruiter_id,
    invitationSentAt: referenceRow.invitation_sent_at,
    params: {
      referenceRequestId: referenceRow.id,
      inviteUrl,
      candidateName: candidateName || "the candidate",
      refereeName: referenceRow.referee_name,
      refereeEmail: referenceRow.referee_email,
      refereeCompany: referenceRow.referee_company,
      relationshipLabel: getRelationshipLabel(referenceRow.relationship),
      message: referenceRow.candidate_message,
      recruiterName,
      recruiterCompany,
      recruiterEmail: resolvedRecruiterEmail,
      historyUrl,
    },
  };
}
