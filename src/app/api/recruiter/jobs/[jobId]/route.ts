import { NextResponse } from "next/server";

import {
  fetchRecruiterJobPostingById,
  updateRecruiterJobPosting,
} from "@/lib/jobs/fetch-recruiter-jobs";
import {
  getCreateJobPostingFieldErrors,
  hasCreateJobPostingErrors,
} from "@/lib/jobs/job-validation";
import type { UpdateJobPostingPayload } from "@/lib/jobs/recruiter-jobs.types";
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

  try {
    const job = await fetchRecruiterJobPostingById(
      supabase,
      recruiterContext.recruiterId,
      jobId,
    );

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
      error instanceof Error ? error.message : "Could not load job posting.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  let body: Partial<UpdateJobPostingPayload>;

  try {
    body = (await request.json()) as Partial<UpdateJobPostingPayload>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const payload: UpdateJobPostingPayload = {
    title: body.title?.trim() ?? "",
    companyDisplayName: body.companyDisplayName?.trim() ?? "",
    category: body.category?.trim() ?? "",
    location: body.location?.trim() ?? "",
    workTypeId: body.workTypeId?.trim() ?? "",
    salaryDisplay: body.salaryDisplay?.trim() ?? "",
    description: body.description?.trim() ?? "",
    responsibilities: body.responsibilities ?? [],
    requirements: body.requirements ?? [],
    isUrgent: Boolean(body.isUrgent),
    publish: body.publish !== false,
  };

  const fieldErrors = getCreateJobPostingFieldErrors(payload);

  if (hasCreateJobPostingErrors(fieldErrors)) {
    const firstError = Object.values(fieldErrors).find(Boolean);

    return NextResponse.json(
      { success: false, error: firstError ?? "Invalid job posting." },
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

  const { data: workType, error: workTypeError } = await supabase
    .from("work_types")
    .select("id")
    .eq("id", payload.workTypeId)
    .eq("is_active", true)
    .maybeSingle();

  if (workTypeError) {
    return NextResponse.json(
      { success: false, error: workTypeError.message },
      { status: 500 },
    );
  }

  if (!workType) {
    return NextResponse.json(
      { success: false, error: "Select a valid work type." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateRecruiterJobPosting(
      supabase,
      recruiterContext.recruiterId,
      jobId,
      {
        title: payload.title,
        companyDisplayName: payload.companyDisplayName,
        category: payload.category,
        location: payload.location,
        workTypeId: payload.workTypeId,
        salaryDisplay: payload.salaryDisplay || null,
        description: payload.description,
        responsibilities: payload.responsibilities,
        requirements: payload.requirements,
        isUrgent: payload.isUrgent,
        status: payload.publish ? "published" : "draft",
      },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Job not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      jobId: updated.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update job posting.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
