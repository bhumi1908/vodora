import type { SupabaseClient, User } from "@supabase/supabase-js";

import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { sendVerificationEmail } from "@/lib/auth/email-verification";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
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
  origin: string;
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
    },
  });

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error, "Unable to create your account."),
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: "Unable to create your account.",
    };
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  const admin = createAdminClient();

  if (EMAIL_FEATURES_ENABLED) {
    await admin
      .from("users")
      .update({ email_verified_at: null })
      .eq("id", data.user.id);

    try {
      await sendVerificationEmail(data.user.id, params.origin, {
        email: params.email.trim(),
        recipientName: `${params.firstName.trim()} ${params.lastName.trim()}`.trim(),
      });
    } catch (sendError) {
      console.error("Verification email failed:", sendError);
      return {
        success: false,
        error:
          "Account created but we could not send the verification email. Please try again or contact support.",
      };
    }

    return {
      success: true,
      needsEmailConfirmation: true,
      email: params.email.trim(),
      redirectTo: `/verify-email?email=${encodeURIComponent(params.email.trim())}`,
    };
  }

  const verifiedAt = new Date().toISOString();

  await admin.auth.admin.updateUserById(data.user.id, {
    email_confirm: true,
  });

  await admin
    .from("users")
    .update({ email_verified_at: verifiedAt })
    .eq("id", data.user.id);

  // Verification email disabled until SendGrid is ready — see email-features.ts.
  // await sendVerificationEmail(data.user.id, params.origin, {
  //   email: params.email.trim(),
  //   recipientName: `${params.firstName.trim()} ${params.lastName.trim()}`.trim(),
  // });

  return {
    success: true,
    needsEmailConfirmation: false,
    email: params.email.trim(),
    redirectTo: "/login?registered=1",
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
