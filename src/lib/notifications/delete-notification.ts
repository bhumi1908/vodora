import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function deleteNotification(
  supabase: Supabase,
  notificationId: string,
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("deleteNotification failed:", error);
    return { success: false, error: "Could not delete notification." };
  }

  if (!data) {
    return { success: false, error: "Notification not found." };
  }

  return { success: true, error: null };
}
