import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { fetchRecruiterConnectionCounts } from "@/lib/connections/fetch-connection-counts";
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

  if (accountType !== "recruiter") {
    return NextResponse.json(
      { success: false, error: "Recruiter access required." },
      { status: 403 },
    );
  }

  const counts = await fetchRecruiterConnectionCounts(supabase);

  return NextResponse.json({
    success: true,
    counts,
  });
}
