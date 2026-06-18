import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
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

  return NextResponse.json({
    success: true,
    profile,
  });
}
