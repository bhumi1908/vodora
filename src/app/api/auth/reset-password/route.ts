import { NextResponse } from "next/server";

import { getAuthErrorMessage } from "@/lib/auth/errors";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import type { ResetPasswordApiResponse } from "@/lib/auth/types";
import { validateResetPassword } from "@/lib/auth/validation";
import {
  AUTH_LOGIN_RATE_LIMIT,
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";

type ResetPasswordRequest = {
  token?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  let body: ResetPasswordRequest;

  try {
    body = (await request.json()) as ResetPasswordRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const token = body.token?.trim();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Reset token is required." },
      { status: 400 },
    );
  }

  const validationError = validateResetPassword({
    password: body.password,
    confirmPassword: body.confirmPassword,
  });

  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }

  const rateLimit = checkRateLimit(
    AUTH_LOGIN_RATE_LIMIT,
    getClientIp(request),
  );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const result = await resetPasswordWithToken(token, body.password!);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: getAuthErrorMessage(result.error, "Unable to reset password."),
      } satisfies ResetPasswordApiResponse,
      { status: 400 },
    );
  }

  const loginParams = new URLSearchParams({ reset: "1" });

  if (result.email) {
    loginParams.set("email", result.email);
  }

  return NextResponse.json({
    success: true,
    redirectTo: `/login?${loginParams.toString()}`,
  } satisfies ResetPasswordApiResponse);
}
