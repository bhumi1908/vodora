import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { fetchReferenceRequestDeliveryContext } from "@/lib/references/fetch-reference-request-delivery-context";
import { resendReferenceInvitationEmail } from "@/lib/references/resend-reference-invitation";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ referenceId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { referenceId } = await context.params;

  if (!referenceId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Reference id is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const candidateContext = await requireOwnCandidate(supabase);

  if (!candidateContext) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const origin = getRequestOrigin(request);
  const deliveryContext = await fetchReferenceRequestDeliveryContext(
    referenceId.trim(),
    origin,
  );

  if (!deliveryContext.success) {
    return NextResponse.json(
      { success: false, error: deliveryContext.error },
      { status: 400 },
    );
  }

  if (deliveryContext.candidateId !== candidateContext.candidateId) {
    return NextResponse.json(
      { success: false, error: "Reference request not found." },
      { status: 404 },
    );
  }

  const result = await resendReferenceInvitationEmail(
    referenceId.trim(),
    origin,
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}
