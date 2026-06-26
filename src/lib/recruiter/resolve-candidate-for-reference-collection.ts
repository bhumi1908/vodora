import { createAdminClient } from "@/lib/supabase/admin";
import { provisionInvitedCandidate } from "@/lib/recruiter/provision-invited-candidate";
import type {
  RecruiterReferenceCollectionCandidateInput,
  ResolveReferenceCollectionCandidateResult,
} from "@/lib/recruiter/reference-collection-candidate.types";
import { splitFullName } from "@/lib/recruiter/split-full-name";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function updateInvitedCandidateDetails(
  candidateId: string,
  input: RecruiterReferenceCollectionCandidateInput,
): Promise<void> {
  const admin = createAdminClient();
  const title = input.title.trim();
  const company = input.company.trim();

  await admin
    .from("candidates")
    .update({
      current_position: title || null,
      current_company_name: company || null,
      profession: title || null,
    })
    .eq("id", candidateId);
}

export async function resolveCandidateForReferenceCollection(
  input: RecruiterReferenceCollectionCandidateInput,
  recruiterId: string,
): Promise<ResolveReferenceCollectionCandidateResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const admin = createAdminClient();

  const { data: userRow, error: userError } = await admin
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userError) {
    console.error("resolveCandidateForReferenceCollection user lookup failed:", userError);
    return {
      success: false,
      error: "Unable to look up candidate email.",
    };
  }

  if (userRow) {
    const { data: candidateRow, error: candidateError } = await admin
      .from("candidates")
      .select("id, invited_by_recruiter_id")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (candidateError) {
      console.error(
        "resolveCandidateForReferenceCollection candidate lookup failed:",
        candidateError,
      );
      return {
        success: false,
        error: "Unable to look up candidate profile.",
      };
    }

    if (candidateRow) {
      const candidateName =
        `${userRow.first_name} ${userRow.last_name}`.trim() ||
        input.name.trim();
      const isInvitedStub = Boolean(candidateRow.invited_by_recruiter_id);

      if (isInvitedStub) {
        await updateInvitedCandidateDetails(candidateRow.id, input);
      }

      return {
        success: true,
        candidateId: candidateRow.id,
        candidateName,
        isNewInvite: false,
        isInvitedStub,
      };
    }

    const { data: recruiterRow } = await admin
      .from("recruiters")
      .select("id")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (recruiterRow) {
      return {
        success: false,
        error: "This email belongs to a recruiter account.",
      };
    }

    return {
      success: false,
      error:
        "This email is registered but does not have a candidate profile. Ask the user to sign in and complete their profile.",
    };
  }

  const provisioned = await provisionInvitedCandidate({
    email: normalizedEmail,
    name: input.name,
    title: input.title,
    company: input.company,
    recruiterId,
  });

  if (!provisioned.success) {
    return provisioned;
  }

  return {
    success: true,
    candidateId: provisioned.candidateId,
    candidateName: provisioned.candidateName,
    isNewInvite: true,
    isInvitedStub: true,
  };
}

export function parseRecruiterReferenceCollectionCandidateName(
  input: RecruiterReferenceCollectionCandidateInput,
): string {
  const { firstName, lastName } = splitFullName(input.name);
  return `${firstName} ${lastName}`.trim();
}
