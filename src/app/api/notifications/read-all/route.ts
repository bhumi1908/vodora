import { NextResponse } from "next/server";

import { markAllNotificationsRead } from "@/lib/notifications/mark-all-notifications-read";
import { createClient } from "@/lib/supabase/server";

export async function PATCH() {
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

  const result = await markAllNotificationsRead(supabase, user.id);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Could not mark notifications as read." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
