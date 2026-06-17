import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";

import { getAccountType } from "@/lib/auth/account-type";

export const getCachedAuthUser = cache(
  async (supabase: SupabaseClient): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  },
);

export const getCachedAccountType = cache(
  async (
    supabase: SupabaseClient,
    user: User,
  ): Promise<"candidate" | "recruiter"> => {
    return getAccountType(supabase, user);
  },
);
