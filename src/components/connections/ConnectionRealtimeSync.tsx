"use client";

import { useConnectionRealtime } from "@/lib/connections/use-connection-realtime";

type ConnectionRealtimeSyncProps = {
  role: "candidate" | "recruiter";
};

export function ConnectionRealtimeSync({ role }: ConnectionRealtimeSyncProps) {
  useConnectionRealtime(role);
  return null;
}
