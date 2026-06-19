import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/auth/password-reset";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import type { ForgotPasswordApiResponse } from "@/lib/auth/types";
import { validateForgotPassword } from "@/lib/auth/validation";
import {
  AUTH_FORGOT_PASSWORD_EMAIL_RATE_LIMIT,
  AUTH_FORGOT_PASSWORD_IP_RATE_LIMIT,
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";

type ForgotPasswordRequest = {
  email?: string;
};

export async function POST(request: Request) {
  let body: ForgotPasswordRequest;

  try {
    body = (await request.json()) as ForgotPasswordRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim();
  const validationError = validateForgotPassword({ email });

  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  const clientIp = getClientIp(request);
  const normalizedEmail = email!.toLowerCase();
  const ipRateLimit = checkRateLimit(
    AUTH_FORGOT_PASSWORD_IP_RATE_LIMIT,
    clientIp,
  );
  const emailRateLimit = checkRateLimit(
    AUTH_FORGOT_PASSWORD_EMAIL_RATE_LIMIT,
    normalizedEmail,
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit.retryAfterSeconds);
  }

  if (!emailRateLimit.allowed) {
    return createRateLimitResponse(emailRateLimit.retryAfterSeconds);
  }

  const origin = getRequestOrigin(request);

  try {
    await sendPasswordResetEmail(normalizedEmail, origin);
  } catch (error) {
    console.error("Forgot password email failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to send reset email. Please try again later.",
      } satisfies ForgotPasswordApiResponse,
      { status: 500 },
    );
  }

  // Always return success to avoid revealing whether the email exists.
  return NextResponse.json({
    success: true,
  } satisfies ForgotPasswordApiResponse);
}
