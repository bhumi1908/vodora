import { createBrowserClient } from "@supabase/ssr";

import { env, validateEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export function createClient() {
  validateEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
