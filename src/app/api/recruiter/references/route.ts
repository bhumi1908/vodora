import { NextResponse } from "next/server";

import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { fetchRecruiterInitiatedReferences } from "@/lib/references/fetch-recruiter-initiated-references";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import {
  getRecruiterReferenceCollectionCandidateFieldErrors,
  getReferenceFieldErrors,
  type RecruiterReferenceCollectionCandidateFieldErrors,
  type ReferenceFieldErrors,
} from "@/lib/profile/reference-validation";
import { createReferenceRequest } from "@/lib/references/create-reference-request";
import { queueReferenceCollectionCandidateEmail } from "@/lib/references/queue-reference-collection-candidate-email";
import { resolveCandidateForReferenceCollection } from "@/lib/recruiter/resolve-candidate-for-reference-collection";
import type { RecruiterReferenceCollectionCandidateInput } from "@/lib/recruiter/reference-collection-candidate.types";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasFieldErrors } from "@/lib/form/field-errors";

type RecruiterReferenceRequestBody = RequestReferenceFormData & {
  candidate: RecruiterReferenceCollectionCandidateInput;
};

async function fetchRecruiterEmailContext(userId: string): Promise<{
  recruiterName: string;
  companyName: string | null;
}> {
  const admin = createAdminClient();

  const { data: userRow } = await admin
    .from("users")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: recruiterRow } = await admin
    .from("recruiters")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle();

  let companyName: string | null = null;

  if (recruiterRow?.company_id) {
    const { data: companyRow } = await admin
      .from("companies")
      .select("name")
      .eq("id", recruiterRow.company_id)
      .maybeSingle();

    companyName = companyRow?.name ?? null;
  }

  return {
    recruiterName: userRow
      ? `${userRow.first_name} ${userRow.last_name}`.trim()
      : "A Vodora recruiter",
    companyName,
  };
}

export async function GET() {
  const supabase = await createClient();
  const context = await requireOwnRecruiter(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const result = await fetchRecruiterInitiatedReferences(context.recruiterId);

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    references: result.references,
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

  const candidateFieldErrors = getRecruiterReferenceCollectionCandidateFieldErrors(
    body.candidate ?? {},
  );
  const referenceFieldErrors = getReferenceFieldErrors(body);
  const fieldErrors = {
    ...candidateFieldErrors,
    ...referenceFieldErrors,
  };

  if (hasFieldErrors(fieldErrors)) {
    return NextResponse.json(
      {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors,
        candidateFieldErrors,
      },
      { status: 400 },
    );
  }

  const candidateInput: RecruiterReferenceCollectionCandidateInput = {
    name: body.candidate.name.trim(),
    title: body.candidate.title.trim(),
    company: body.candidate.company.trim(),
    email: body.candidate.email.trim().toLowerCase(),
  };

  const resolved = await resolveCandidateForReferenceCollection(
    candidateInput,
    context.recruiterId,
  );

  if (!resolved.success) {
    return NextResponse.json(
      { success: false, error: resolved.error },
      { status: 400 },
    );
  }

  const emailContext = await fetchRecruiterEmailContext(context.userId);
  const { candidate: _ignored, ...referenceForm } = body;

  const result = await createReferenceRequest(
    supabase,
    {
      candidateId: resolved.candidateId,
      userId: context.userId,
      recruiterId: context.recruiterId,
      candidateName: resolved.candidateName,
      recruiterName: emailContext.recruiterName,
      recruiterCompany: emailContext.companyName,
    },
    referenceForm,
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

  queueReferenceCollectionCandidateEmail({
    candidateEmail: candidateInput.email,
    candidateName: resolved.candidateName,
    recruiterName: emailContext.recruiterName,
    companyName: emailContext.companyName,
    refereeName: referenceForm.name.trim(),
    origin: getRequestOrigin(request),
    isNewInvite: resolved.isNewInvite,
    isInvitedStub: resolved.isInvitedStub,
  });

  return NextResponse.json({
    success: true,
    id: result.id,
    candidateName: resolved.candidateName,
  });
}
