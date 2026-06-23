import { NextResponse } from "next/server";

import { fetchReferenceInvitationByToken } from "@/lib/references/fetch-reference-invitation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Invitation token is required." },
      { status: 400 },
    );
  }

  const result = await fetchReferenceInvitationByToken(token);

  if (!result.invitation) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Invitation not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    invitation: result.invitation,
  });
}
