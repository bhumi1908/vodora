import { NextResponse } from "next/server";

import { isRecruiterAccount } from "@/lib/auth/account-type";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { resolvePostLoginRedirect } from "@/lib/auth/safe-redirect";
import { completePendingSignupForUser } from "@/lib/auth/signup-flow";
import type { LoginApiResponse } from "@/lib/auth/types";
import { validateCompanyEmail } from "@/lib/auth/validation";
import {
  AUTH_LOGIN_RATE_LIMIT,
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

type LoginRequest = {
  email?: string;
  password?: string;
  accountType?: "candidate" | "recruiter";
  redirect?: string;
};

export async function POST(request: Request) {
  let body: LoginRequest;

  try {
    body = (await request.json()) as LoginRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
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

  if (body.accountType === "recruiter") {
    const companyEmailError = validateCompanyEmail(email);
    if (companyEmailError) {
      return NextResponse.json(
        { success: false, error: companyEmailError },
        { status: 400 },
      );
    }
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      {
        success: false,
        error: getAuthErrorMessage(error, "Invalid email or password."),
      },
      { status: 401 },
    );
  }

  if (await isRecruiterAccount(supabase, data.user)) {
    const companyEmailError = validateCompanyEmail(email);
    if (companyEmailError) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: companyEmailError },
        { status: 400 },
      );
    }
  }

  await completePendingSignupForUser(supabase, data.user);

  const redirectTo = await resolvePostLoginRedirect(
    supabase,
    data.user,
    body.redirect,
  );

  await supabase.rpc("record_user_login");

  return NextResponse.json({
    success: true,
    redirectTo,
  } satisfies LoginApiResponse);
}
