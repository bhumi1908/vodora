import { createAdminClient } from "@/lib/supabase/admin";
import { splitFullName } from "@/lib/recruiter/split-full-name";

type ProvisionInvitedCandidateInput = {
  email: string;
  name: string;
  title: string;
  company: string;
  recruiterId: string;
};

async function getCandidateRoleId(): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("roles")
    .select("id")
    .eq("name", "candidate")
    .maybeSingle();

  if (error || !data?.id) {
    console.error("Failed to resolve candidate role:", error);
    return null;
  }

  return data.id;
}

type ProvisionInvitedCandidateResult =
  | {
      success: true;
      userId: string;
      candidateId: string;
      candidateName: string;
    }
  | {
      success: false;
      error: string;
    };

async function resolveExistingCandidateByEmail(
  normalizedEmail: string,
  input: ProvisionInvitedCandidateInput,
): Promise<ProvisionInvitedCandidateResult | null> {
  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("users")
    .select("id, first_name, last_name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!userRow) {
    return null;
  }

  const { data: candidateRow } = await admin
    .from("candidates")
    .select("id")
    .eq("user_id", userRow.id)
    .maybeSingle();

  if (!candidateRow) {
    return null;
  }

  const candidateName =
    `${userRow.first_name} ${userRow.last_name}`.trim() || input.name.trim();

  await admin
    .from("candidates")
    .update({
      current_position: input.title.trim() || null,
      current_company_name: input.company.trim() || null,
      profession: input.title.trim() || null,
      invited_by_recruiter_id: input.recruiterId,
    })
    .eq("id", candidateRow.id);

  return {
    success: true,
    userId: userRow.id,
    candidateId: candidateRow.id,
    candidateName,
  };
}

export async function provisionInvitedCandidate(
  input: ProvisionInvitedCandidateInput,
): Promise<ProvisionInvitedCandidateResult> {
  const admin = createAdminClient();
  const normalizedEmail = input.email.trim().toLowerCase();
  const { firstName, lastName } = splitFullName(input.name);
  const candidateName = `${firstName} ${lastName}`.trim();
  const title = input.title.trim();
  const company = input.company.trim();

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        invited_for_reference_collection: true,
        invited_by_recruiter_id: input.recruiterId,
      },
    });

  if (authError || !authData.user) {
    const duplicateEmail =
      authError?.message?.toLowerCase().includes("already") ?? false;

    if (duplicateEmail) {
      const resolved = await resolveExistingCandidateByEmail(
        normalizedEmail,
        input,
      );

      if (resolved) {
        return resolved;
      }
    }

    console.error("provisionInvitedCandidate createUser failed:", authError);
    return {
      success: false,
      error: "Unable to create a candidate profile for this email.",
    };
  }

  const userId = authData.user.id;

  const { error: userUpdateError } = await admin
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", userId);

  if (userUpdateError) {
    console.error("provisionInvitedCandidate user update failed:", userUpdateError);
  }

  const roleId = await getCandidateRoleId();

  if (!roleId) {
    return {
      success: false,
      error: "Unable to assign candidate role.",
    };
  }

  const { error: roleError } = await admin.from("user_roles").insert({
    user_id: userId,
    role_id: roleId,
  });

  if (roleError && roleError.code !== "23505") {
    console.error("provisionInvitedCandidate role insert failed:", roleError);
    return {
      success: false,
      error: "Unable to assign candidate role.",
    };
  }

  const { data: candidate, error: candidateError } = await admin
    .from("candidates")
    .insert({
      user_id: userId,
      current_position: title || null,
      current_company_name: company || null,
      profession: title || null,
      invited_by_recruiter_id: input.recruiterId,
      visibility: "private",
      is_profile_complete: false,
    })
    .select("id")
    .single();

  if (candidateError || !candidate) {
    console.error("provisionInvitedCandidate candidate insert failed:", candidateError);
    return {
      success: false,
      error: "Unable to create candidate profile.",
    };
  }

  return {
    success: true,
    userId,
    candidateId: candidate.id,
    candidateName,
  };
}

export async function clearInvitedCandidateFlags(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: authUser, error: authError } =
    await admin.auth.admin.getUserById(userId);

  if (authError || !authUser.user) {
    console.error("clearInvitedCandidateFlags getUserById failed:", authError);
    return;
  }

  const metadata = authUser.user.user_metadata ?? {};

  const { error: metadataError } = await admin.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...metadata,
        invited_for_reference_collection: false,
        password_set_at: new Date().toISOString(),
      },
    },
  );

  if (metadataError) {
    console.error("clearInvitedCandidateFlags metadata update failed:", metadataError);
  }

  const { error: candidateError } = await admin
    .from("candidates")
    .update({ invited_by_recruiter_id: null })
    .eq("user_id", userId);

  if (candidateError) {
    console.error("clearInvitedCandidateFlags candidate update failed:", candidateError);
  }
}
