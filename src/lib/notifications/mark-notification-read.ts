import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function markNotificationRead(
  supabase: Supabase,
  notificationId: string,
  read: boolean,
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", notificationId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("markNotificationRead failed:", error);
    return { success: false, error: "Could not update notification." };
  }

  if (!data) {
    return { success: false, error: "Notification not found." };
  }

  return { success: true, error: null };
}
