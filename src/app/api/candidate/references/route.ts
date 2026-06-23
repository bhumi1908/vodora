import { NextResponse } from "next/server";

import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { createReferenceRequest } from "@/lib/references/create-reference-request";
import {
  cancelReferenceRequest,
  fetchCandidateReferences,
} from "@/lib/references/fetch-candidate-references";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const result = await fetchCandidateReferences(supabase, context.candidateId);

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
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: RequestReferenceFormData;

  try {
    body = (await request.json()) as RequestReferenceFormData;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", context.userId)
    .maybeSingle();

  const candidateName = userRow
    ? `${userRow.first_name} ${userRow.last_name}`.trim()
    : "A Vodora candidate";

  const result = await createReferenceRequest(
    supabase,
    {
      candidateId: context.candidateId,
      userId: context.userId,
      candidateName,
    },
    {
      ...body,
      requireCompanyEmail: body.requireCompanyEmail ?? true,
    },
    getRequestOrigin(request),
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error, fieldErrors: result.fieldErrors },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    id: result.id,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const referenceId = url.searchParams.get("id");

  if (!referenceId) {
    return NextResponse.json(
      { success: false, error: "Reference id is required." },
      { status: 400 },
    );
  }

  const result = await cancelReferenceRequest(
    supabase,
    context.candidateId,
    referenceId,
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
