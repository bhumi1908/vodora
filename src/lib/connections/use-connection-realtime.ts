"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { showNewConnectionRequestToast } from "@/lib/connections/connection-toast";
import { fetchConnectionCounts } from "@/lib/query/connection-fetchers";
import { connectionKeys } from "@/lib/query/connection-keys";
import { createClient } from "@/lib/supabase/client";

export function useConnectionRealtime(role: "candidate" | "recruiter", enabled = true) {
  const queryClient = useQueryClient();
  const previousReceivedRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function syncCounts(showToast: boolean) {
      const counts = await fetchConnectionCounts(role);

      if (cancelled) {
        return;
      }

      queryClient.setQueryData(connectionKeys.counts(role), counts);

      if (!initializedRef.current) {
        previousReceivedRef.current = counts.pendingReceived;
        initializedRef.current = true;
        return;
      }

      const previousReceived = previousReceivedRef.current ?? 0;

      if (showToast && counts.pendingReceived > previousReceived) {
        showNewConnectionRequestToast(counts.pendingReceived, role);
      }

      previousReceivedRef.current = counts.pendingReceived;
    }

    void syncCounts(false);

    const channel = supabase
      .channel(`connections-realtime:${role}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: connectionKeys.all });
          void syncCounts(true);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, role]);
}
