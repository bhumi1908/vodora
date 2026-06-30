import { NextResponse } from "next/server";

import { fetchNotificationCounts } from "@/lib/notifications/fetch-notification-counts";
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

  const result = await fetchNotificationCounts(supabase);

  if (result.error || !result.data) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Could not load notification counts." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    counts: result.data,
  });
}
