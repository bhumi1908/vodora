import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildClearedRememberMePreferenceCookie } from "@/lib/auth/session-cookies";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  try {
    const cookieStore = await cookies();
    const cleared = buildClearedRememberMePreferenceCookie();
    cookieStore.set(cleared.name, cleared.value, cleared.options);
  } catch {
    // Route handlers may run without mutable cookies in edge cases.
  }

  return NextResponse.json({ success: true });
}
