import { NextResponse } from "next/server";

import { getSignupEmailStatus } from "@/lib/auth/check-signup-email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required." },
      { status: 400 },
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const status = await getSignupEmailStatus(email);

  return NextResponse.json({
    success: true,
    ...status,
  });
}
