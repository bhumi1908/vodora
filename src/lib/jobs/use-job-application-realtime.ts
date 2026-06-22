"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { showNewJobApplicationToast } from "@/lib/jobs/job-toast";
import { fetchRecruiterApplicationTotal } from "@/lib/query/job-application-fetchers";
import { jobKeys } from "@/lib/query/keys";
import { createClient } from "@/lib/supabase/client";

export function useJobApplicationRealtime(role: "candidate" | "recruiter", enabled = true) {
  const queryClient = useQueryClient();
  const previousTotalRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    if (role === "recruiter") {
      async function syncTotals(showToast: boolean) {
        const total = await fetchRecruiterApplicationTotal();

        if (cancelled) {
          return;
        }

        queryClient.setQueryData(jobKeys.recruiterApplicationTotal(), total);

        if (!initializedRef.current) {
          previousTotalRef.current = total;
          initializedRef.current = true;
          return;
        }

        const previousTotal = previousTotalRef.current ?? 0;

        if (showToast && total > previousTotal) {
          showNewJobApplicationToast();
        }

        previousTotalRef.current = total;
      }

      void syncTotals(false);

      const channel = supabase
        .channel("job-applications-realtime:recruiter")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "job_applications",
          },
          () => {
            void queryClient.invalidateQueries({ queryKey: jobKeys.recruiter() });
            void syncTotals(true);
          },
        )
        .subscribe();

      return () => {
        cancelled = true;
        void supabase.removeChannel(channel);
      };
    }

    const channel = supabase
      .channel("job-applications-realtime:candidate")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_applications",
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: jobKeys.appliedIds() });
          void queryClient.invalidateQueries({ queryKey: jobKeys.applied() });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, role]);
}
