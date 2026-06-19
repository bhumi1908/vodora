import { NextResponse } from "next/server";

import { fetchPublishedJobById } from "@/lib/jobs/fetch-published-jobs";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
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
    const job = await fetchPublishedJobById(supabase, id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load job.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
