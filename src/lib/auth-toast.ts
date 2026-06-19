import { toast } from "sonner";

import type { AccessDeniedReason } from "@/lib/auth/access-denied";
import { ACCESS_DENIED_CANDIDATE_ONLY } from "@/lib/auth/access-denied";

export function showLoginSuccessToast() {
  toast.success("Welcome back! You've signed in successfully.");
}

export function showLogoutSuccessToast() {
  toast.success("You've been signed out.");
}

export function showRegistrationSuccessToast(needsEmailConfirmation?: boolean) {
  if (needsEmailConfirmation) {
    toast.success(
      "Account created! Check your email to verify your account.",
    );
    return;
  }

  toast.success("Account created successfully!");
}

export function showEmailVerifiedToast() {
  toast.success("Your email has been verified. You can sign in now.");
}

export function showPasswordResetSuccessToast() {
  toast.success("Your password has been reset. You can sign in now.");
}

export function showAccessDeniedToast(reason: AccessDeniedReason) {
  if (reason === ACCESS_DENIED_CANDIDATE_ONLY) {
    toast.error("You don't have permission to access candidate pages.");
    return;
  }

  toast.error("You don't have permission to access recruiter pages.");
}
