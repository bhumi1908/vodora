import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/signup-flow";
import { getSignupEmailStatus } from "@/lib/auth/check-signup-email";
import { sendInvitedCandidateSetupLinkEmail } from "@/lib/references/queue-reference-collection-candidate-email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SendSetupLinkBody = {
  email?: string;
};

export async function POST(request: Request) {
  let body: SendSetupLinkBody;

  try {
    body = (await request.json()) as SendSetupLinkBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase() ?? "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const status = await getSignupEmailStatus(email);

  if (status.code !== "invited_reference_stub") {
    return NextResponse.json(
      {
        success: false,
        error:
          status.code === "already_registered"
            ? "This account is already registered. Sign in instead."
            : "No invited profile was found for this email.",
      },
      { status: 400 },
    );
  }

  const result = await sendInvitedCandidateSetupLinkEmail(
    email,
    getRequestOrigin(request),
    "there",
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
