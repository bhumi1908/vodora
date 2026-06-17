export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
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
