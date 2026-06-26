import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { getCachedCandidateRecruiterProfile } from "@/lib/recruiter/fetch-candidate-recruiter-profile";
import {
  redactPrivateRecruiterProfileFields,
  resolveRecruiterProfileVisibility,
} from "@/lib/recruiter/recruiter-profile-visibility";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ recruiterId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { recruiterId } = await context.params;

  if (!recruiterId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Recruiter id is required." },
      { status: 400 },
    );
  }

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

  if (accountType !== "candidate") {
    return NextResponse.json(
      { success: false, error: "Candidate access required." },
      { status: 403 },
    );
  }

  const profile = await getCachedCandidateRecruiterProfile(supabase, recruiterId);

  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Recruiter not found." },
      { status: 404 },
    );
  }

  const connection = profile.connection;

  const visibility = resolveRecruiterProfileVisibility({
    candidateView: true,
    connection,
  });

  const visibleProfile = redactPrivateRecruiterProfileFields(
    profile,
    visibility.showContactDetails,
  );

  return NextResponse.json({
    success: true,
    profile: visibleProfile,
  });
}
