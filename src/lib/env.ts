export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_SECURE: process.env.SMTP_SECURE ?? "",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ?? "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ?? "Vodora",
} as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_KEYS.filter((key) => {
    const value = env[key];
    return value.trim() === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `Required environment variable(s) missing: ${missing.join(", ")}. Add them to .env.local (see .env.example).`,
    );
  }
}
