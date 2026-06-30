import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { fetchRecruiterCandidateConnectionStatus } from "@/lib/connections/fetch-recruiter-candidate-connection-status";
import { checkRecruiterReferenceGrant } from "@/lib/references/check-recruiter-reference-grant";
import {
  redactPrivateProfileFields,
  resolveProfileVisibility,
} from "@/lib/profile/profile-visibility";
import { fetchRecruiterCandidateSavedStatus } from "@/lib/recruiter/fetch-candidate-save-status";
import { getCachedRecruiterCandidateProfile } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ vodoraId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { vodoraId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const accountType = await getAccountType(supabase, user);

  if (accountType !== "recruiter") {
    return NextResponse.json(
      { success: false, error: "Recruiter access required." },
      { status: 403 },
    );
  }

  const profile = await getCachedRecruiterCandidateProfile(supabase, vodoraId);

  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Candidate not found." },
      { status: 404 },
    );
  }

  const connection = profile.candidateId
    ? await fetchRecruiterCandidateConnectionStatus(supabase, profile.candidateId)
    : null;

  const hasReferenceAccess = profile.candidateId
    ? await checkRecruiterReferenceGrant(supabase, profile.candidateId)
    : false;

  const isSaved = profile.candidateId
    ? await fetchRecruiterCandidateSavedStatus(supabase, profile.candidateId)
    : false;

  const visibility = resolveProfileVisibility({
    recruiterView: true,
    connection,
    hasReferenceAccess,
  });

  const visibleProfile = redactPrivateProfileFields(
    profile,
    visibility.showContactDetails,
  );

  return NextResponse.json({
    success: true,
    profile: visibleProfile,
    hasReferenceAccess,
    isSaved,
  });
}
