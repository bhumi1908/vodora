import { createAdminClient } from "@/lib/supabase/admin";

export type SignupEmailStatusCode =
  | "available"
  | "invited_reference_stub"
  | "invited_referee_stub"
  | "already_registered"
  | "recruiter_account";

export type SignupEmailStatus = {
  code: SignupEmailStatusCode;
  recruiterName?: string;
  companyName?: string;
};

function isInvitedReferenceStub(
  metadata: Record<string, unknown> | undefined,
  invitedByRecruiterId: string | null | undefined,
): boolean {
  if (metadata?.invited_for_reference_collection === true) {
    return true;
  }

  return Boolean(invitedByRecruiterId);
}

export async function getSignupEmailStatus(
  email: string,
): Promise<SignupEmailStatus> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { code: "available" };
  }

  const admin = createAdminClient();

  const { data: userRow, error: userError } = await admin
    .from("users")
    .select("id, email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userError) {
    console.error("getSignupEmailStatus user lookup failed:", userError);
    return { code: "available" };
  }

  if (!userRow) {
    return { code: "available" };
  }

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(userRow.id);

  if (authError) {
    console.error("getSignupEmailStatus auth lookup failed:", authError);
  }

  const metadata = (authData.user?.user_metadata ?? {}) as Record<
    string,
    unknown
  >;

  const { data: candidateRow } = await admin
    .from("candidates")
    .select("invited_by_recruiter_id")
    .eq("user_id", userRow.id)
    .maybeSingle();

  if (metadata.invited_for_referee_profile === true && candidateRow) {
    return { code: "invited_referee_stub" };
  }

  if (candidateRow && isInvitedReferenceStub(metadata, candidateRow.invited_by_recruiter_id)) {
    let recruiterName = "A Vodora recruiter";
    let companyName: string | undefined;

    if (candidateRow.invited_by_recruiter_id) {
      const { data: recruiterRow } = await admin
        .from("recruiters")
        .select("user_id, company_id")
        .eq("id", candidateRow.invited_by_recruiter_id)
        .maybeSingle();

      if (recruiterRow?.user_id) {
        const { data: recruiterUser } = await admin
          .from("users")
          .select("first_name, last_name")
          .eq("id", recruiterRow.user_id)
          .maybeSingle();

        if (recruiterUser) {
          recruiterName =
            `${recruiterUser.first_name} ${recruiterUser.last_name}`.trim() ||
            recruiterName;
        }
      }

      if (recruiterRow?.company_id) {
        const { data: companyRow } = await admin
          .from("companies")
          .select("name")
          .eq("id", recruiterRow.company_id)
          .maybeSingle();

        companyName = companyRow?.name ?? undefined;
      }
    }

    return {
      code: "invited_reference_stub",
      recruiterName,
      companyName,
    };
  }

  const { data: recruiterRow } = await admin
    .from("recruiters")
    .select("id")
    .eq("user_id", userRow.id)
    .maybeSingle();

  if (recruiterRow && !candidateRow) {
    return { code: "recruiter_account" };
  }

  return { code: "already_registered" };
}
