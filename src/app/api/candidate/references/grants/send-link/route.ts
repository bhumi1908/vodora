import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { sendReferenceShareLinkToRecruiter } from "@/lib/references/send-reference-share-link-to-recruiter";
import type { SendReferenceShareLinkToRecruiterPayload } from "@/lib/references/reference-passport-share.types";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: SendReferenceShareLinkToRecruiterPayload;

  try {
    body = (await request.json()) as SendReferenceShareLinkToRecruiterPayload;
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

  const result = await sendReferenceShareLinkToRecruiter(
    supabase,
    context.candidateId,
    context.userId,
    body,
    getRequestOrigin(request),
  );

  if (result.error || !result.share) {
    return NextResponse.json(
      {
        success: false,
        error: result.error ?? "Unable to send share link email.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    share: result.share,
  });
}
