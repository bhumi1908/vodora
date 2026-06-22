import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import {
  fetchRecruiterApplicationTotal,
  requireRecruiterId,
} from "@/lib/jobs/fetch-recruiter-application-total";
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

  const recruiterId = await requireRecruiterId(supabase, user.id);

  if (!recruiterId) {
    return NextResponse.json(
      { success: false, error: "Recruiter profile not found." },
      { status: 404 },
    );
  }

  const result = await fetchRecruiterApplicationTotal(supabase, recruiterId);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    total: result.total,
  });
}
