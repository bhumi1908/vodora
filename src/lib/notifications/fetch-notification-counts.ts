import type { SupabaseClient } from "@supabase/supabase-js";

import type { NotificationCounts } from "@/lib/notifications/notification.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchNotificationCounts(
  supabase: Supabase,
): Promise<{ data: NotificationCounts | null; error: string | null }> {
  const [totalResult, unreadResult] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
  ]);

  if (totalResult.error || unreadResult.error) {
    console.error("fetchNotificationCounts failed:", totalResult.error ?? unreadResult.error);
    return { data: null, error: "Could not load notification counts." };
  }

  return {
    data: {
      total: totalResult.count ?? 0,
      unread: unreadResult.count ?? 0,
    },
    error: null,
  };
}
