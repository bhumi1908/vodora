import { NextResponse } from "next/server";

import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import {
  fetchRecruiterJobApplicantDetail,
  updateRecruiterJobApplicationStatus,
} from "@/lib/jobs/fetch-recruiter-job-applications";
import {
  JOB_APPLICATION_STATUS_OPTIONS,
  mapApplicationStatus,
} from "@/lib/jobs/map-application-status";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ jobId: string; applicationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { jobId, applicationId } = await context.params;
  const supabase = await createClient();
  const recruiterContext = await requireOwnRecruiter(supabase);

  if (!recruiterContext) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const result = await fetchRecruiterJobApplicantDetail(
    supabase,
    recruiterContext.recruiterId,
    jobId,
    applicationId,
  );

  if (result.error || !result.data) {
    const status =
      result.error === "Job not found." || result.error === "Application not found."
        ? 404
        : 500;

    return NextResponse.json(
      { success: false, error: result.error ?? "Application not found." },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    applicant: result.data,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { jobId, applicationId } = await context.params;
  let body: { status?: string };

  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const requestedStatus = body.status?.trim();

  if (!requestedStatus) {
    return NextResponse.json(
      { success: false, error: "Status is required." },
      { status: 400 },
    );
  }

  const normalizedStatus = mapApplicationStatus(requestedStatus);

  if (!JOB_APPLICATION_STATUS_OPTIONS.includes(normalizedStatus)) {
    return NextResponse.json(
      { success: false, error: "Invalid application status." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const recruiterContext = await requireOwnRecruiter(supabase);

  if (!recruiterContext) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const result = await updateRecruiterJobApplicationStatus(
    supabase,
    recruiterContext.recruiterId,
    jobId,
    applicationId,
    normalizedStatus as JobApplicationStatus,
  );

  if (!result.success) {
    const status =
      result.error === "Job not found." || result.error === "Application not found."
        ? 404
        : 500;

    return NextResponse.json(
      { success: false, error: result.error ?? "Could not update status." },
      { status },
    );
  }

  return NextResponse.json({ success: true, status: normalizedStatus });
}
