import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { getCachedRecruiterDashboardData } from "@/lib/recruiter/fetch-recruiter-dashboard";
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

  const data = await getCachedRecruiterDashboardData(supabase, user.id);

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
