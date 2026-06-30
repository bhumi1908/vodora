import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function deleteAllNotifications(
  supabase: Supabase,
  userId: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("recipient_user_id", userId);

  if (error) {
    console.error("deleteAllNotifications failed:", error);
    return { success: false, error: "Could not clear notifications." };
  }

  return { success: true, error: null };
}
