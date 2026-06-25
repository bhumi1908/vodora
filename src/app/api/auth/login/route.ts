import { after, NextResponse } from "next/server";

import { isRecruiterAccount } from "@/lib/auth/account-type";
import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { getVerifyEmailPath } from "@/lib/auth/email-verification-status";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import type { PostLoginContext } from "@/lib/auth/post-login-redirect";
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

type LoginUserRow = {
  login_count: number | null;
  email: string | null;
  email_verified_at?: string | null;
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
    const authError = getAuthErrorMessage(error, "Invalid email or password.");

    if (
      EMAIL_FEATURES_ENABLED &&
      authError.includes("verify your email")
    ) {
      return NextResponse.json(
        {
          success: false,
          needsEmailVerification: true,
          redirectTo: getVerifyEmailPath(email),
        } satisfies LoginApiResponse,
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: authError,
      },
      { status: 401 },
    );
  }

  const userFields = EMAIL_FEATURES_ENABLED
    ? "email_verified_at, login_count, email"
    : "login_count, email";

  const [{ data: userRow, error: userLookupError }, isRecruiter] =
    await Promise.all([
      supabase
        .from("users")
        .select(userFields)
        .eq("id", data.user.id)
        .maybeSingle(),
      isRecruiterAccount(supabase, data.user),
    ]);

  const typedUserRow = userRow as LoginUserRow | null;

  if (
    EMAIL_FEATURES_ENABLED &&
    (userLookupError || !typedUserRow?.email_verified_at)
  ) {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        success: false,
        needsEmailVerification: true,
        redirectTo: getVerifyEmailPath(email),
      } satisfies LoginApiResponse,
      { status: 403 },
    );
  }

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

  const loginContext: PostLoginContext = {
    accountType: isRecruiter ? "recruiter" : "candidate",
    loginCount: typedUserRow?.login_count ?? 0,
    email: typedUserRow?.email ?? data.user.email ?? "",
  };

  const [redirectTo] = await Promise.all([
    resolvePostLoginRedirect(supabase, data.user, body.redirect, loginContext),
    completePendingSignupForUser(supabase, data.user),
  ]);

  after(async () => {
    try {
      await supabase.rpc("record_user_login");
    } catch (recordError) {
      console.error("Failed to record user login:", recordError);
    }
  });

  return NextResponse.json({
    success: true,
    redirectTo,
  } satisfies LoginApiResponse);
}
