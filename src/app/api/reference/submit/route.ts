import { NextResponse } from "next/server";

import type { ReferenceResponseFormData } from "@/components/profile/reference/types";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { fetchReferenceInvitationByToken } from "@/lib/references/fetch-reference-invitation";
import { submitReferenceResponse } from "@/lib/references/submit-reference-response";
import { createClient } from "@/lib/supabase/server";

type SubmitBody = {
  token: string;
  response: ReferenceResponseFormData;
};

export async function POST(request: Request) {
  let body: SubmitBody;

  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body.token?.trim()) {
    return NextResponse.json(
      { success: false, error: "Invitation token is required." },
      { status: 400 },
    );
  }

  const invitationResult = await fetchReferenceInvitationByToken(body.token);

  if (!invitationResult.invitation) {
    return NextResponse.json(
      {
        success: false,
        error: invitationResult.error ?? "Invitation not found.",
      },
      { status: 404 },
    );
  }

  const invitation = invitationResult.invitation;

  if (invitation.isExpired) {
    return NextResponse.json(
      { success: false, error: "This invitation has expired." },
      { status: 400 },
    );
  }

  if (invitation.alreadySubmitted) {
    return NextResponse.json(
      { success: false, error: "This reference has already been submitted." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let auth:
    | {
        supabase: typeof supabase;
        userId: string;
        userEmail: string;
      }
    | undefined;

  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();

    if (userRow?.email) {
      auth = {
        supabase,
        userId: user.id,
        userEmail: userRow.email,
      };
    }
  }

  const result = await submitReferenceResponse({
    referenceRequestId: invitation.id,
    invitedEmail: invitation.refereeEmail,
    refereeName: invitation.refereeName,
    refereeTitle: invitation.refereeTitle,
    refereeCompany: invitation.refereeCompany,
    referenceType: invitation.referenceType,
    input: body.response,
    origin: getRequestOrigin(request),
    auth,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    status: result.status,
    responseId: result.responseId,
    ...(result.welcomeRedirectTo
      ? { welcomeRedirectTo: result.welcomeRedirectTo }
      : {}),
    ...(result.profileSetupRequested
      ? { profileSetupRequested: true }
      : {}),
  });
}
