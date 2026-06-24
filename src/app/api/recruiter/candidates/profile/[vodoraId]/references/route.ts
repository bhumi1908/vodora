import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { checkRecruiterReferenceGrant } from "@/lib/references/check-recruiter-reference-grant";
import { fetchRecruiterCandidateReferences } from "@/lib/references/fetch-recruiter-candidate-references";
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

  if (!profile?.candidateId) {
    return NextResponse.json(
      { success: false, error: "Candidate not found." },
      { status: 404 },
    );
  }

  const hasGrant = await checkRecruiterReferenceGrant(
    supabase,
    profile.candidateId,
  );

  if (!hasGrant) {
    return NextResponse.json(
      { success: false, error: "Reference access not granted." },
      { status: 403 },
    );
  }

  const result = await fetchRecruiterCandidateReferences(
    supabase,
    profile.candidateId,
  );

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    references: result.references,
  });
}
