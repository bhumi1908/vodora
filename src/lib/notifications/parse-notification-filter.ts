import type { NotificationReadFilter } from "@/lib/notifications/notification.types";

export function parseNotificationReadFilter(
  value: string | null,
): NotificationReadFilter {
  if (value === "unread" || value === "read" || value === "all") {
    return value;
  }

  return "all";
}
