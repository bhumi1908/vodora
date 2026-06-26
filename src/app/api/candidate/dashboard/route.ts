import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { getCachedCandidateDashboardData } from "@/lib/candidate/fetch-candidate-dashboard";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const data = await getCachedCandidateDashboardData(supabase, user.id);

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Could not load dashboard." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    ...data,
  });
}
