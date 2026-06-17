import { NextResponse } from "next/server";

import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getRequestOrigin } from "@/lib/auth/signup-flow";
import type { ResendVerificationApiResponse } from "@/lib/auth/types";
import {
  AUTH_RESEND_EMAIL_RATE_LIMIT,
  AUTH_RESEND_IP_RATE_LIMIT,
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: getAuthErrorMessage(
          error,
          "Unable to resend verification email.",
        ),
      } satisfies ResendVerificationApiResponse,
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
  } satisfies ResendVerificationApiResponse);
}
