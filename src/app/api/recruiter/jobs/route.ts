import { NextResponse } from "next/server";

import {
  createRecruiterJobPosting,
  fetchRecruiterJobPostings,
  fetchRecruiterJobStats,
  fetchRecruiterWorkTypes,
} from "@/lib/jobs/fetch-recruiter-jobs";
import {
  getCreateJobPostingFieldErrors,
  hasCreateJobPostingErrors,
} from "@/lib/jobs/job-validation";
import type { CreateJobPostingPayload } from "@/lib/jobs/recruiter-jobs.types";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const [jobs, workTypes, stats] = await Promise.all([
      fetchRecruiterJobPostings(supabase, context.recruiterId),
      fetchRecruiterWorkTypes(supabase),
      fetchRecruiterJobStats(supabase, context.recruiterId),
    ]);

    return NextResponse.json({
      success: true,
      jobs,
      workTypes,
      stats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load job postings.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: Partial<CreateJobPostingPayload>;

  try {
    body = (await request.json()) as Partial<CreateJobPostingPayload>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const payload: CreateJobPostingPayload = {
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
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
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
    const created = await createRecruiterJobPosting(supabase, {
      recruiterId: context.recruiterId,
      companyId: context.companyId,
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
    });

    return NextResponse.json({
      success: true,
      jobId: created.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create job posting.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
