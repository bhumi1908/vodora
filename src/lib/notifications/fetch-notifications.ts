import type { SupabaseClient } from "@supabase/supabase-js";

import { mapNotificationRow } from "@/lib/notifications/map-notification-row";
import type {
  NotificationListResult,
  NotificationReadFilter,
} from "@/lib/notifications/notification.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchNotifications(
  supabase: Supabase,
  options: {
    page: number;
    limit: number;
    filter: NotificationReadFilter;
  },
): Promise<{ data: NotificationListResult | null; error: string | null }> {
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;

  let query = supabase
    .from("notifications")
    .select(
      "id, type, title, body, action_url, entity_type, entity_id, actor_user_id, metadata, read_at, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.filter === "unread") {
    query = query.is("read_at", null);
  } else if (options.filter === "read") {
    query = query.not("read_at", "is", null);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("fetchNotifications failed:", error);
    return { data: null, error: "Could not load notifications." };
  }

  const totalCount = count ?? 0;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / options.limit);

  return {
    data: {
      notifications: (data ?? []).map(mapNotificationRow),
      totalCount,
      page: options.page,
      limit: options.limit,
      totalPages,
    },
    error: null,
  };
}
