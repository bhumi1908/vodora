import { NextResponse } from "next/server";

import { getSignupEmailStatus } from "@/lib/auth/check-signup-email";
import { getEmailFormatError } from "@/lib/email/validate-email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required." },
      { status: 400 },
    );
  }

  const formatError = getEmailFormatError(email);

  if (formatError) {
    return NextResponse.json(
      { success: false, error: formatError },
      { status: 400 },
    );
  }

  const status = await getSignupEmailStatus(email);

  return NextResponse.json({
    success: true,
    ...status,
  });
}
