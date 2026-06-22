import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { searchRecruitersForCandidates } from "@/lib/recruiter/fetch-candidate-recruiter-directory";
import { RECRUITER_DIRECTORY_PAGE_SIZE } from "@/lib/recruiter/recruiter-directory-options";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const specialisation = searchParams.get("specialisation") ?? "All";
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(
        searchParams.get("limit") ?? String(RECRUITER_DIRECTORY_PAGE_SIZE),
        10,
      ) || RECRUITER_DIRECTORY_PAGE_SIZE,
    ),
  );

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

  const result = await searchRecruitersForCandidates(supabase, {
    query,
    specialisation,
    page,
    limit,
  });

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    recruiters: result.recruiters,
    total: result.totalCount,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
}
