import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { resendReferenceInvitationEmail } from "@/lib/references/resend-reference-invitation";
import { fetchReferenceRequestDeliveryContext } from "@/lib/references/fetch-reference-request-delivery-context";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
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
  const recruiterContext = await requireOwnRecruiter(supabase);

  if (!recruiterContext) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const deliveryContext = await fetchReferenceRequestDeliveryContext(
    referenceId.trim(),
    getRequestOrigin(request),
    user?.email ?? null,
  );

  if (!deliveryContext.success) {
    return NextResponse.json(
      { success: false, error: deliveryContext.error },
      { status: 400 },
    );
  }

  if (
    deliveryContext.requestedByRecruiterId !== recruiterContext.recruiterId
  ) {
    return NextResponse.json(
      { success: false, error: "Reference request not found." },
      { status: 404 },
    );
  }

  const result = await resendReferenceInvitationEmail(
    referenceId.trim(),
    getRequestOrigin(request),
    user?.email ?? null,
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}
