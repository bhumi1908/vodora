import { NextResponse } from "next/server";

import { deleteAllNotifications } from "@/lib/notifications/delete-all-notifications";
import { fetchNotifications } from "@/lib/notifications/fetch-notifications";
import { parseNotificationListQuery } from "@/lib/notifications/parse-notification-query";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const query = parseNotificationListQuery(url);
  const result = await fetchNotifications(supabase, query);

  if (result.error || !result.data) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Could not load notifications." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    ...result.data,
  });
}

export async function DELETE() {
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

  const result = await deleteAllNotifications(supabase, user.id);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Could not clear notifications." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
