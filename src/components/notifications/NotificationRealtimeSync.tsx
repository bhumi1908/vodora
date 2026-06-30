"use client";

import { useNotificationRealtime } from "@/lib/notifications/use-notification-realtime";

type NotificationRealtimeSyncProps = {
  enabled?: boolean;
};

export function NotificationRealtimeSync({ enabled = true }: NotificationRealtimeSyncProps) {
  useNotificationRealtime(enabled);
  return null;
}
