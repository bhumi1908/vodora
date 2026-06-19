"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { isSignupProfile } from "@/lib/auth/registration";
import { createClient } from "@/lib/supabase/client";

export type AccountType = "candidate" | "recruiter";

export function useAccountType(user: User | null): AccountType | null {
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  useEffect(() => {
    if (!user) {
      setAccountType(null);
      return;
    }

    const signupProfile = user.user_metadata?.signup_profile;
    if (isSignupProfile(signupProfile)) {
      setAccountType(signupProfile.type);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    const userId = user.id;

    void (async () => {
      const { data } = await supabase
        .from("recruiters")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!cancelled) {
        setAccountType(data ? "recruiter" : "candidate");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return accountType;
}
