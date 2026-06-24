import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/signup-flow";
import {
  normalizeReferenceSharePermissions,
} from "@/lib/references/reference-permissions";
import {
  createReferencePassportShare,
  fetchReferencePassportShares,
  revokeReferencePassportShare,
} from "@/lib/references/reference-passport-shares";
import type { CreateReferenceSharePayload } from "@/lib/references/reference-passport-share.types";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const result = await fetchReferencePassportShares(
    supabase,
    context.candidateId,
    getRequestOrigin(request),
  );

  if (result.error) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    shares: result.shares,
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

  let body: CreateReferenceSharePayload = {};

  try {
    body = (await request.json()) as CreateReferenceSharePayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const includedReferenceIds = Array.isArray(body.includedReferenceIds)
    ? body.includedReferenceIds.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : undefined;

  const expiresInDays =
    typeof body.expiresInDays === "number" && Number.isFinite(body.expiresInDays)
      ? Math.max(0, Math.floor(body.expiresInDays))
      : null;

  const result = await createReferencePassportShare(
    supabase,
    context.candidateId,
    {
      shareType: body.shareType,
      includedReferenceIds,
      permissions: normalizeReferenceSharePermissions(body.permissions),
      expiresInDays,
    },
    getRequestOrigin(request),
  );

  if (result.error || !result.share) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Unable to create share link." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    share: result.share,
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

  const shareId = new URL(request.url).searchParams.get("id");

  if (!shareId) {
    return NextResponse.json(
      { success: false, error: "Share id is required." },
      { status: 400 },
    );
  }

  const result = await revokeReferencePassportShare(
    supabase,
    context.candidateId,
    shareId,
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
