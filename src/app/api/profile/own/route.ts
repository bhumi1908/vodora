import { NextResponse } from "next/server";

import { getCachedOwnCandidateProfileRaw } from "@/lib/profile/fetch-own-candidate-profile";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const profile = await getCachedOwnCandidateProfileRaw(supabase);

  if (!profile?.user) {
    return NextResponse.json(
      { success: false, error: "Could not load profile." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    profile,
  });
}
