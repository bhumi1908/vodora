"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { recruiterKeys } from "@/lib/query/keys";

export function RecruiterCandidateProfileViewTracker() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: recruiterKeys.dashboard() });
  }, [queryClient]);

  return null;
}
