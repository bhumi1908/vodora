import { NextResponse } from "next/server";

import { isRecruiterAccount } from "@/lib/auth/account-type";
import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
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
  rememberMe?: boolean;
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

  const rememberMe = body.rememberMe !== false;
  const supabase = await createClient({ rememberMe });

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

  if (EMAIL_FEATURES_ENABLED) {
    const { data: userRow, error: userLookupError } = await supabase
      .from("users")
      .select("email_verified_at")
      .eq("id", data.user.id)
      .maybeSingle();

    if (userLookupError || !userRow?.email_verified_at) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          success: false,
          error:
            "Please verify your email before signing in. Check your inbox for the verification link.",
        },
        { status: 403 },
      );
    }
  }

  const isRecruiter = await isRecruiterAccount(supabase, data.user);

  if (body.accountType === "recruiter" && !isRecruiter) {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        success: false,
        error:
          "No recruiter account found with these credentials. Sign in as a candidate or create a recruiter account.",
      },
      { status: 403 },
    );
  }

  if (isRecruiter) {
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
