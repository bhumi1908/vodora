import { createAdminClient } from "@/lib/supabase/admin";
import { splitFullName } from "@/lib/recruiter/split-full-name";

type ProvisionInvitedRefereeInput = {
  email: string;
  name: string;
  title: string;
  company: string;
};

type ProvisionInvitedRefereeResult =
  | {
      success: true;
      userId: string;
      isNewStub: boolean;
    }
  | {
      success: false;
      error: string;
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

async function resolveExistingRefereeByEmail(
  normalizedEmail: string,
  input: ProvisionInvitedRefereeInput,
): Promise<ProvisionInvitedRefereeResult | null> {
  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!userRow) {
    return null;
  }

  const { data: authData } = await admin.auth.admin.getUserById(userRow.id);
  const metadata = (authData.user?.user_metadata ?? {}) as Record<string, unknown>;

  const { data: candidateRow } = await admin
    .from("candidates")
    .select("id")
    .eq("user_id", userRow.id)
    .maybeSingle();

  if (!candidateRow) {
    const { data: recruiterRow } = await admin
      .from("recruiters")
      .select("id")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (recruiterRow) {
      return {
        success: false,
        error: "This email is registered as a recruiter account.",
      };
    }

    return null;
  }

  await admin
    .from("candidates")
    .update({
      current_position: input.title.trim() || null,
      current_company_name: input.company.trim() || null,
      profession: input.title.trim() || null,
    })
    .eq("id", candidateRow.id);

  const isRefereeStub = metadata.invited_for_referee_profile === true;

  return {
    success: true,
    userId: userRow.id,
    isNewStub: isRefereeStub,
  };
}

export async function provisionInvitedReferee(
  input: ProvisionInvitedRefereeInput,
): Promise<ProvisionInvitedRefereeResult> {
  const admin = createAdminClient();
  const normalizedEmail = input.email.trim().toLowerCase();
  const { firstName, lastName } = splitFullName(input.name);
  const title = input.title.trim();
  const company = input.company.trim();

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        invited_for_referee_profile: true,
      },
    });

  if (authError || !authData.user) {
    const duplicateEmail =
      authError?.message?.toLowerCase().includes("already") ?? false;

    if (duplicateEmail) {
      const resolved = await resolveExistingRefereeByEmail(normalizedEmail, input);

      if (resolved) {
        return resolved;
      }
    }

    console.error("provisionInvitedReferee createUser failed:", authError);
    return {
      success: false,
      error: "Unable to create a profile for this email.",
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
    console.error("provisionInvitedReferee user update failed:", userUpdateError);
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
    console.error("provisionInvitedReferee role insert failed:", roleError);
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
      visibility: "private",
      is_profile_complete: false,
    })
    .select("id")
    .single();

  if (candidateError || !candidate) {
    console.error("provisionInvitedReferee candidate insert failed:", candidateError);
    return {
      success: false,
      error: "Unable to create candidate profile.",
    };
  }

  return {
    success: true,
    userId,
    isNewStub: true,
  };
}
