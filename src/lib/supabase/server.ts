import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { prepareAuthCookiesForPersistence } from "@/lib/auth/session-cookies";
import { env, validateEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

type CreateClientOptions = {
  rememberMe?: boolean;
};

export async function createClient(options?: CreateClientOptions) {
  validateEnv();

  const cookieStore = await cookies();
  const persistOptions = {
    getAll: () => cookieStore.getAll(),
    rememberMeOverride: options?.rememberMe,
  };

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            const prepared = prepareAuthCookiesForPersistence(
              cookiesToSet,
              persistOptions,
            );

            prepared.forEach(({ name, value, options: cookieOptions }) => {
              cookieStore.set(name, value, cookieOptions);
            });
          } catch {
            // Called from a Server Component; middleware refreshes sessions.
          }
        },
      },
    },
  );
}
