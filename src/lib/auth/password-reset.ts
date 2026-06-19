import { createHash, randomBytes } from "crypto";

import { EMAIL_FEATURES_ENABLED } from "@/lib/auth/email-features";
import { sendEmail } from "@/lib/email/sendgrid";
import {
  buildResetPasswordEmailHtml,
  buildResetPasswordEmailText,
} from "@/lib/email/templates/reset-password";
import { createAdminClient } from "@/lib/supabase/admin";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

type PasswordResetTokenRow = {
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
};

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(RESET_TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function buildResetPasswordUrl(origin: string, token: string): string {
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

async function findUserByEmail(
  email: string,
): Promise<UserLookupRow | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("users")
    .select("id, email, first_name, last_name")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Failed to look up user for password reset:", error.message);
    return null;
  }

  return data;
}

async function storeResetToken(userId: string, tokenHash: string): Promise<void> {
  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  await admin
    .from("password_reset_tokens")
    .delete()
    .eq("user_id", userId)
    .is("used_at", null);

  const { error } = await admin.from("password_reset_tokens").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  origin: string,
): Promise<{ sent: boolean }> {
  const user = await findUserByEmail(email);

  if (!user) {
    return { sent: false };
  }

  if (!EMAIL_FEATURES_ENABLED) {
    return { sent: false };
  }

  const { token, tokenHash } = generateResetToken();
  await storeResetToken(user.id, tokenHash);

  const resetUrl = buildResetPasswordUrl(origin, token);
  const recipientName = `${user.first_name} ${user.last_name}`.trim();

  // Email sending disabled until SendGrid is ready — see email-features.ts.
  const emailResult = await sendEmail({
    to: user.email,
    subject: "Reset your Vodora password",
    html: buildResetPasswordEmailHtml({ resetUrl, recipientName }),
    text: buildResetPasswordEmailText({ resetUrl, recipientName }),
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error);
  }

  return { sent: true };
}

export async function validateResetToken(
  token: string,
): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = hashResetToken(token);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("password_reset_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as PasswordResetTokenRow;

  if (row.used_at) {
    return null;
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return null;
  }

  return { userId: row.user_id, tokenId: row.id };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const tokenData = await validateResetToken(token);

  if (!tokenData) {
    return {
      success: false,
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const admin = createAdminClient();

  const { error: updateError } = await admin.auth.admin.updateUserById(
    tokenData.userId,
    { password: newPassword },
  );

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  const usedAt = new Date().toISOString();

  await admin
    .from("password_reset_tokens")
    .update({ used_at: usedAt })
    .eq("id", tokenData.tokenId);

  await admin
    .from("password_reset_tokens")
    .delete()
    .eq("user_id", tokenData.userId)
    .is("used_at", null);

  return { success: true };
}
