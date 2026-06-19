import { NextResponse } from "next/server";

import { getAccountType } from "@/lib/auth/account-type";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getDashboardPath } from "@/lib/auth/routes";
import type { ChangePasswordApiResponse } from "@/lib/auth/types";
import { validateResetPassword } from "@/lib/auth/validation";
import {
  AUTH_LOGIN_RATE_LIMIT,
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

type ChangePasswordRequest = {
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  let body: ChangePasswordRequest;

  try {
    body = (await request.json()) as ChangePasswordRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Your session expired. Please sign in and try again." },
      { status: 401 },
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: body.password!,
  });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: getAuthErrorMessage(error, "Unable to update password."),
      } satisfies ChangePasswordApiResponse,
      { status: 400 },
    );
  }

  const accountType = await getAccountType(supabase, user);

  return NextResponse.json({
    success: true,
    redirectTo: getDashboardPath(accountType),
  } satisfies ChangePasswordApiResponse);
}
