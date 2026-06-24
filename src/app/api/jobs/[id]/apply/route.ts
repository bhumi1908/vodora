import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { fetchJobApplyContext } from "@/lib/jobs/fetch-job-apply-context";
import { fetchPublishedJobById } from "@/lib/jobs/fetch-published-jobs";
import { submitJobApplication } from "@/lib/jobs/submit-job-application";
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

  const accountType = await getAccountType(supabase, user);

  if (accountType !== "candidate") {
    return NextResponse.json(
      { success: false, error: "Candidate access required." },
      { status: 403 },
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

    const result = await fetchJobApplyContext(supabase, id, {
      title: job.title,
      company: job.company,
      recruiterName: job.recruiter.name,
    });

    if (result.error || !result.context) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Could not load application details." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      context: result.context,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load application details.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
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

  const accountType = await getAccountType(supabase, user);

  if (accountType !== "candidate") {
    return NextResponse.json(
      { success: false, error: "Candidate access required." },
      { status: 403 },
    );
  }

  let body: {
    coverLetter?: unknown;
    coverLetterDocumentId?: unknown;
    referencesAttached?: unknown;
    includedReferenceIds?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (typeof body.coverLetter !== "string") {
    return NextResponse.json(
      { success: false, error: "Cover letter is required." },
      { status: 400 },
    );
  }

  const coverLetterDocumentId =
    typeof body.coverLetterDocumentId === "string"
      ? body.coverLetterDocumentId
      : null;

  const includedReferenceIds = Array.isArray(body.includedReferenceIds)
    ? body.includedReferenceIds.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : undefined;

  const result = await submitJobApplication(supabase, id, {
    coverLetter: body.coverLetter,
    coverLetterDocumentId,
    referencesAttached:
      typeof body.referencesAttached === "boolean"
        ? body.referencesAttached
        : false,
    includedReferenceIds,
  });

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    applicationId: result.applicationId,
    alreadyApplied: result.alreadyApplied,
  });
}
