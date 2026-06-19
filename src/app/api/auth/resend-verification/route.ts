import { NextResponse } from "next/server";

import { resendVerificationEmail } from "@/lib/auth/email-verification";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import type { ResendVerificationApiResponse } from "@/lib/auth/types";
import {
  AUTH_RESEND_EMAIL_RATE_LIMIT,
  AUTH_RESEND_IP_RATE_LIMIT,
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";

type ResendVerificationRequest = {
  email?: string;
};

export async function POST(request: Request) {
  let body: ResendVerificationRequest;

  try {
    body = (await request.json()) as ResendVerificationRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required." },
      { status: 400 },
    );
  }

  const clientIp = getClientIp(request);
  const normalizedEmail = email.toLowerCase();
  const ipRateLimit = checkRateLimit(AUTH_RESEND_IP_RATE_LIMIT, clientIp);
  const emailRateLimit = checkRateLimit(
    AUTH_RESEND_EMAIL_RATE_LIMIT,
    normalizedEmail,
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit.retryAfterSeconds);
  }

  if (!emailRateLimit.allowed) {
    return createRateLimitResponse(emailRateLimit.retryAfterSeconds);
  }

  const origin = getRequestOrigin(request);

  void resendVerificationEmail(normalizedEmail, origin).catch((error) => {
    console.error("Resend verification email failed:", error);
  });

  // Always return success to avoid revealing whether the email exists or is verified.
  return NextResponse.json({
    success: true,
  } satisfies ResendVerificationApiResponse);
}
