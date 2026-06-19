import { NextResponse } from "next/server";

import { fetchPublishedJobs } from "@/lib/jobs/fetch-published-jobs";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "All";
  const location = searchParams.get("location") ?? "All Locations";
  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? "5", 10) || 5),
  );
  const workTypes = searchParams.getAll("workType");

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

  try {
    const result = await fetchPublishedJobs(supabase, {
      category,
      workTypes,
      location,
      query,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load jobs.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
