import { NextResponse } from "next/server";

import { repostRecruiterJobPosting } from "@/lib/jobs/fetch-recruiter-jobs";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const supabase = await createClient();
  const recruiterContext = await requireOwnRecruiter(supabase);

  if (!recruiterContext) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const reposted = await repostRecruiterJobPosting(
      supabase,
      recruiterContext.recruiterId,
      jobId,
    );

    if (!reposted) {
      return NextResponse.json(
        { success: false, error: "Job not found or cannot be re-posted." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      jobId: reposted.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not re-post job.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
