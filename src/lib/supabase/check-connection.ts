import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export type SupabaseConnectionResult = {
  ok: boolean;
  message: string;
  projectUrl: string;
  details?: string;
};

/**
 * Probes Supabase without requiring any tables.
 * A "table not found" response means URL + anon key are valid.
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionResult> {
  const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL;

  if (!projectUrl || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      ok: false,
      message: "Missing Supabase environment variables",
      projectUrl: projectUrl || "(not set)",
      details: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("_vodora_connection_probe")
      .select("id")
      .limit(1);

    if (!error) {
      return {
        ok: true,
        message: "Connected to Supabase",
        projectUrl,
        details: "REST API responded successfully.",
      };
    }

    const code = error.code ?? "";
    const hint = error.message ?? "";

    if (
      code === "PGRST205" ||
      code === "42P01" ||
      hint.includes("Could not find the table") ||
      hint.includes("does not exist")
    ) {
      return {
        ok: true,
        message: "Connected to Supabase",
        projectUrl,
        details:
          "Credentials are valid. No tables exist yet — that is expected for a new project.",
      };
    }

    if (
      code === "PGRST301" ||
      hint.toLowerCase().includes("invalid api key") ||
      hint.toLowerCase().includes("jwt")
    ) {
      return {
        ok: false,
        message: "Invalid Supabase anon key",
        projectUrl,
        details: hint,
      };
    }

    return {
      ok: false,
      message: "Could not verify Supabase connection",
      projectUrl,
      details: hint || code || "Unknown error",
    };
  } catch (cause) {
    const details =
      cause instanceof Error ? cause.message : "Network or configuration error";

    return {
      ok: false,
      message: "Failed to reach Supabase",
      projectUrl,
      details,
    };
  }
}
