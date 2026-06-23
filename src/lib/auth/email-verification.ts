import { createHash, randomBytes } from "crypto";

import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { sendEmail } from "@/lib/email/smtp";
import {
  buildVerifyEmailHtml,
  buildVerifyEmailText,
} from "@/lib/email/templates/verify-email";
import { parseSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createAdminClient } from "@/lib/supabase/admin";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

type EmailVerificationTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
};

type UserLookupRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified_at: string | null;
};

function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateVerificationToken(): {
  token: string;
  tokenHash: string;
} {
  const token = randomBytes(VERIFICATION_TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashVerificationToken(token) };
}

export function buildVerifyEmailUrl(
  origin: string,
  token: string,
  redirect?: string | null,
): string {
  const url = new URL("/api/auth/verify-email", origin);
  url.searchParams.set("token", token);
  const safeRedirect = redirect?.trim();

  if (safeRedirect) {
    url.searchParams.set("redirect", safeRedirect);
  }

  return url.toString();
}

async function findUserByEmail(
  email: string,
): Promise<UserLookupRow | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("users")
    .select("id, email, first_name, last_name, email_verified_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to look up user for email verification:",
      error.message,
    );
    return null;
  }

  return data;
}

async function findUserById(userId: string): Promise<UserLookupRow | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("users")
    .select("id, email, first_name, last_name, email_verified_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to look up user for email verification:",
      error.message,
    );
    return null;
  }

  return data;
}

async function getAuthUserEmailAndName(
  userId: string,
): Promise<{ email: string; recipientName: string } | null> {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user?.email) {
    console.error(
      "Failed to look up auth user for email verification:",
      error?.message ?? "missing email",
    );
    return null;
  }

  const firstName = data.user.user_metadata?.first_name;
  const lastName = data.user.user_metadata?.last_name;
  const recipientName =
    typeof firstName === "string" && typeof lastName === "string"
      ? `${firstName} ${lastName}`.trim()
      : "";

  return {
    email: data.user.email,
    recipientName,
  };
}

async function resolveVerificationRecipient(
  userId: string,
  overrides?: { email?: string; recipientName?: string },
): Promise<{ email: string; recipientName: string; alreadyVerified: boolean }> {
  if (overrides?.email) {
    return {
      email: overrides.email.trim(),
      recipientName: overrides.recipientName?.trim() ?? "",
      alreadyVerified: false,
    };
  }

  const user = await findUserById(userId);

  if (user) {
    return {
      email: user.email,
      recipientName: `${user.first_name} ${user.last_name}`.trim(),
      alreadyVerified: Boolean(user.email_verified_at),
    };
  }

  const authUser = await getAuthUserEmailAndName(userId);

  if (!authUser) {
    throw new Error("User not found for email verification.");
  }

  return {
    email: authUser.email,
    recipientName: authUser.recipientName,
    alreadyVerified: false,
  };
}

async function storeVerificationToken(
  userId: string,
  tokenHash: string,
): Promise<void> {
  const admin = createAdminClient();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_TTL_MS,
  ).toISOString();

  await admin
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", userId)
    .is("used_at", null);

  const { error } = await admin.from("email_verification_tokens").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}

type VerificationEmailPayload = {
  email: string;
  recipientName: string;
  verifyUrl: string;
};

async function buildVerificationEmailPayload(
  userId: string,
  origin: string,
  overrides?: {
    email?: string;
    recipientName?: string;
    redirect?: string | null;
  },
): Promise<VerificationEmailPayload | null> {
  const recipient = await resolveVerificationRecipient(userId, overrides);

  if (recipient.alreadyVerified) {
    throw new Error("Email is already verified.");
  }

  if (!EMAIL_FEATURES_ENABLED) {
    return null;
  }

  const { token, tokenHash } = generateVerificationToken();
  await storeVerificationToken(userId, tokenHash);
  const safeRedirect = parseSafeRedirectPath(overrides?.redirect);

  return {
    email: recipient.email,
    recipientName: recipient.recipientName,
    verifyUrl: buildVerifyEmailUrl(origin, token, safeRedirect),
  };
}

async function deliverVerificationEmail(
  payload: VerificationEmailPayload,
): Promise<void> {
  const emailResult = await sendEmail({
    to: payload.email,
    subject: "Verify your Vodora account",
    html: buildVerifyEmailHtml({
      verifyUrl: payload.verifyUrl,
      recipientName: payload.recipientName,
    }),
    text: buildVerifyEmailText({
      verifyUrl: payload.verifyUrl,
      recipientName: payload.recipientName,
    }),
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error);
  }
}

export async function sendVerificationEmail(
  userId: string,
  origin: string,
  overrides?: {
    email?: string;
    recipientName?: string;
    redirect?: string | null;
  },
): Promise<void> {
  const payload = await buildVerificationEmailPayload(userId, origin, overrides);

  if (!payload) {
    return;
  }

  await deliverVerificationEmail(payload);
}

export async function queueVerificationEmail(
  userId: string,
  origin: string,
  overrides?: {
    email?: string;
    recipientName?: string;
    redirect?: string | null;
  },
): Promise<void> {
  const payload = await buildVerificationEmailPayload(userId, origin, overrides);

  if (!payload) {
    return;
  }

  void deliverVerificationEmail(payload).catch((error) => {
    console.error("Background verification email failed:", error);
  });
}

export async function resendVerificationEmail(
  email: string,
  origin: string,
): Promise<void> {
  const user = await findUserByEmail(email);

  if (!user) {
    return;
  }

  if (user.email_verified_at) {
    return;
  }

  void queueVerificationEmail(user.id, origin, {
    email: user.email,
    recipientName: `${user.first_name} ${user.last_name}`.trim(),
  }).catch((error) => {
    console.error("Background resend verification email failed:", error);
  });
}

export async function validateVerificationToken(
  token: string,
): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = hashVerificationToken(token);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("email_verification_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as EmailVerificationTokenRow;

  if (row.used_at) {
    return null;
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return null;
  }

  return { userId: row.user_id, tokenId: row.id };
}

export async function verifyEmailWithToken(
  token: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const tokenData = await validateVerificationToken(token);

  if (!tokenData) {
    return {
      success: false,
      error:
        "This verification link is invalid or has expired. Please request a new one.",
    };
  }

  const admin = createAdminClient();
  const verifiedAt = new Date().toISOString();

  const { error: updateError } = await admin.auth.admin.updateUserById(
    tokenData.userId,
    { email_confirm: true },
  );

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  await admin
    .from("users")
    .update({ email_verified_at: verifiedAt })
    .eq("id", tokenData.userId);

  await admin
    .from("email_verification_tokens")
    .update({ used_at: verifiedAt })
    .eq("id", tokenData.tokenId);

  await admin
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", tokenData.userId)
    .is("used_at", null);

  return { success: true };
}

export async function isUserEmailVerified(userId: string): Promise<boolean> {
  const user = await findUserById(userId);
  return Boolean(user?.email_verified_at);
}
