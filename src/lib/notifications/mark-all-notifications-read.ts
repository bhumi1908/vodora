import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function markAllNotificationsRead(
  supabase: Supabase,
  userId: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("markAllNotificationsRead failed:", error);
    return { success: false, error: "Could not mark notifications as read." };
  }

  return { success: true, error: null };
}
