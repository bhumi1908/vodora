import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAuthErrorMessage } from "@/lib/auth/errors";
import { env } from "@/lib/env";
import {
  completeSignupProfile,
  getPostSignupRedirect,
  isSignupProfile,
} from "@/lib/auth/registration";
import type { SignupApiResponse, SignupProfile } from "@/lib/auth/types";

type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  signupProfile: SignupProfile;
  emailRedirectTo: string;
};

export async function runSignupFlow(
  supabase: SupabaseClient,
  params: SignUpParams,
): Promise<SignupApiResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        first_name: params.firstName.trim(),
        last_name: params.lastName.trim(),
        signup_profile: params.signupProfile,
      },
      emailRedirectTo: params.emailRedirectTo,
    },
  });

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error, "Unable to create your account."),
    };
  }

  if (data.session) {
    return finalizeSignupProfile(supabase, params.signupProfile);
  }

  // Email confirmation enabled — no session until the user verifies.
  return {
    success: true,
    needsEmailConfirmation: true,
    email: params.email.trim(),
    redirectTo: `/verify-email?email=${encodeURIComponent(params.email.trim())}`,
  };
}

export async function finalizeSignupProfile(
  supabase: SupabaseClient,
  profile: SignupProfile,
): Promise<SignupApiResponse> {
  const { error } = await completeSignupProfile(supabase, profile);

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(
        error,
        "Account created but profile setup failed. Please contact support.",
      ),
    };
  }

  return {
    success: true,
    redirectTo: getPostSignupRedirect(profile),
  };
}

export async function completePendingSignupForUser(
  supabase: SupabaseClient,
  user: User,
): Promise<string | null> {
  const signupProfile = user.user_metadata?.signup_profile;

  if (!isSignupProfile(signupProfile)) {
    return null;
  }

  const { error } = await completeSignupProfile(supabase, signupProfile);

  if (error) {
    console.error("Failed to complete pending signup:", error.message);
    return null;
  }

  return getPostSignupRedirect(signupProfile);
}

export function getRequestOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
