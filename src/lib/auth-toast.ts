import { toast } from "sonner";

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
