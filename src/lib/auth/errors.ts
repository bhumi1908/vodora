export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : fallback;

  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (normalized.includes("password")) {
    return "Password must be at least 8 characters.";
  }

  if (normalized.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (normalized.includes("not authenticated")) {
    return "Your session expired. Please sign in and try again.";
  }

  if (normalized.includes("terms must be accepted")) {
    return "You must agree to the Terms of Service and Privacy Policy.";
  }

  if (
    normalized.includes("email not confirmed") ||
    normalized.includes("email address not confirmed")
  ) {
    return "Please verify your email before signing in. Check your inbox for the verification link.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Too many email requests. Please wait before trying again.";
  }

  return message;
}
