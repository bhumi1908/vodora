import { NextResponse } from "next/server";

import { fetchRecruiterJobApplicants } from "@/lib/jobs/fetch-recruiter-job-applications";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const supabase = await createClient();
  const recruiterContext = await requireOwnRecruiter(supabase);

  if (!recruiterContext) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const result = await fetchRecruiterJobApplicants(
    supabase,
    recruiterContext.recruiterId,
    jobId,
  );

  if (result.error || !result.data) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Job not found." },
      { status: result.error === "Job not found." ? 404 : 500 },
    );
  }

  return NextResponse.json({
    success: true,
    job: result.data.job,
    applicants: result.data.applicants,
  });
}
