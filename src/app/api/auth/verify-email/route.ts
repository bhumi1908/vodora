import { NextResponse } from "next/server";

import { verifyEmailWithToken } from "@/lib/auth/email-verification";
import { getRequestOrigin } from "@/lib/auth/signup-flow";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const origin = getRequestOrigin(request);

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const result = await verifyEmailWithToken(token);

  if (!result.success) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}/login?verified=1`);
}
