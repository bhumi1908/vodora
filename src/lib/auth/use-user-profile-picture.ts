"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import type { AccountType } from "@/lib/auth/use-account-type";
import { createClient } from "@/lib/supabase/client";

export function useUserProfilePicture(
  user: User | null,
  accountType: AccountType | null,
): string | null {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accountType) {
      setProfilePictureUrl(null);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    const userId = user.id;
    const table = accountType === "recruiter" ? "recruiters" : "candidates";

    async function loadProfilePicture() {
      const { data } = await supabase
        .from(table)
        .select("profile_picture_url")
        .eq("user_id", userId)
        .maybeSingle();

      if (!cancelled) {
        setProfilePictureUrl(data?.profile_picture_url ?? null);
      }
    }

    void loadProfilePicture();

    return () => {
      cancelled = true;
    };
  }, [user, accountType]);

  return profilePictureUrl;
}
