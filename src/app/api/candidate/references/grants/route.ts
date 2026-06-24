import { NextResponse } from "next/server";

import { fetchConnectedRecruitersForShare } from "@/lib/references/fetch-connected-recruiters-for-share";
import {
  createManualReferenceRecruiterGrant,
  fetchReferenceRecruiterGrants,
  revokeReferenceRecruiterGrant,
} from "@/lib/references/reference-recruiter-grants";
import type { CreateReferenceRecruiterGrantPayload } from "@/lib/references/reference-passport-share.types";
import { normalizeReferenceSharePermissions } from "@/lib/references/reference-permissions";
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

  const [grantsResult, recruitersResult] = await Promise.all([
    fetchReferenceRecruiterGrants(supabase, context.candidateId),
    fetchConnectedRecruitersForShare(supabase),
  ]);

  if (grantsResult.error || recruitersResult.error) {
    return NextResponse.json(
      {
        success: false,
        error: grantsResult.error ?? recruitersResult.error,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    grants: grantsResult.grants,
    connectedRecruiters: recruitersResult.recruiters,
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

  let body: CreateReferenceRecruiterGrantPayload;

  try {
    body = (await request.json()) as CreateReferenceRecruiterGrantPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (typeof body.recruiterId !== "string" || !body.recruiterId) {
    return NextResponse.json(
      { success: false, error: "Recruiter id is required." },
      { status: 400 },
    );
  }

  const includedReferenceIds = Array.isArray(body.includedReferenceIds)
    ? body.includedReferenceIds.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : undefined;

  const result = await createManualReferenceRecruiterGrant(
    supabase,
    context.candidateId,
    {
      recruiterId: body.recruiterId,
      shareType: body.shareType,
      includedReferenceIds,
      permissions: normalizeReferenceSharePermissions(body.permissions),
    },
  );

  if (result.error || !result.grant) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Unable to share with recruiter." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    grant: result.grant,
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

  const grantId = new URL(request.url).searchParams.get("id");

  if (!grantId) {
    return NextResponse.json(
      { success: false, error: "Grant id is required." },
      { status: 400 },
    );
  }

  const result = await revokeReferenceRecruiterGrant(
    supabase,
    context.candidateId,
    grantId,
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
