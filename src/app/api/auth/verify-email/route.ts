import { NextResponse } from "next/server";

import { verifyEmailWithToken } from "@/lib/auth/email-verification";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { parseSafeRedirectPath } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const origin = getRequestOrigin(request);
  const safeRedirect = parseSafeRedirectPath(searchParams.get("redirect"));

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const result = await verifyEmailWithToken(token);

  if (!result.success) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const loginParams = new URLSearchParams({ verified: "1" });

  if (safeRedirect) {
    loginParams.set("redirect", safeRedirect);
  }

  return NextResponse.redirect(`${origin}/login?${loginParams.toString()}`);
}
