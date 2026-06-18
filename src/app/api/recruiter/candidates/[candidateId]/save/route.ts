import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { toggleCandidateSave } from "@/lib/recruiter/toggle-candidate-save";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ candidateId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { candidateId } = await context.params;

  if (!candidateId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Candidate id is required." },
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

  if (accountType !== "recruiter") {
    return NextResponse.json(
      { success: false, error: "Recruiter access required." },
      { status: 403 },
    );
  }

  const result = await toggleCandidateSave(supabase, candidateId);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    saved: result.saved,
  });
}
