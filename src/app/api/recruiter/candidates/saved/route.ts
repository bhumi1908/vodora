import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { fetchRecruiterSavedCandidates } from "@/lib/recruiter/fetch-recruiter-saved-candidates";
import { createClient } from "@/lib/supabase/server";

function parsePagination(url: URL): { page: number; limit: number } {
  const rawPage = Number(url.searchParams.get("page") ?? "1");
  const rawLimit = Number(url.searchParams.get("limit") ?? "10");

  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
    limit: Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 10,
  };
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const { page, limit } = parsePagination(url);

  const result = await fetchRecruiterSavedCandidates(supabase, page, limit);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    ...result,
  });
}
