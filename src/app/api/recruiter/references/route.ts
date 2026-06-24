import { NextResponse } from "next/server";

import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import type { ReferenceFieldErrors } from "@/lib/profile/reference-validation";
import { createReferenceRequest } from "@/lib/references/create-reference-request";
import {
  fetchReferenceCollectionCandidateDetails,
  fetchReferenceCollectionCandidateOptions,
} from "@/lib/recruiter/fetch-reference-collection-candidates";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type RecruiterReferenceRequestBody = RequestReferenceFormData & {
  candidateId: string;
};

export async function GET() {
  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const result = await fetchReferenceCollectionCandidateOptions(supabase);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    candidates: result.candidates,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: RecruiterReferenceRequestBody;

  try {
    body = (await request.json()) as RecruiterReferenceRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body.candidateId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Candidate is required." },
      { status: 400 },
    );
  }

  const candidateResult = await fetchReferenceCollectionCandidateDetails(
    supabase,
    body.candidateId.trim(),
  );

  if (!candidateResult.candidate) {
    return NextResponse.json(
      {
        success: false,
        error: candidateResult.error ?? "Candidate not found.",
      },
      { status: 404 },
    );
  }

  const { candidateId, name: candidateName } = candidateResult.candidate;
  const { candidateId: _ignored, ...referenceForm } = body;

  const result = await createReferenceRequest(
    supabase,
    {
      candidateId,
      userId: context.userId,
      recruiterId: context.recruiterId,
      candidateName,
    },
    {
      ...referenceForm,
      requireCompanyEmail: referenceForm.requireCompanyEmail ?? true,
    },
    getRequestOrigin(request),
  );

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        fieldErrors: result.fieldErrors as ReferenceFieldErrors | undefined,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    id: result.id,
    candidateName,
  });
}
