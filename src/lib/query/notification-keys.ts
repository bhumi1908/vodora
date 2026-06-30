import { NOTIFICATION_PAGE_SIZE } from "@/lib/notifications/notification-options";
import type { NotificationReadFilter } from "@/lib/notifications/notification.types";

export const notificationKeys = {
  all: ["notifications"] as const,
  counts: () => [...notificationKeys.all, "counts"] as const,
  list: (page: number, limit: number, filter: NotificationReadFilter) =>
    [...notificationKeys.all, "list", { page, limit, filter }] as const,
};

export { NOTIFICATION_PAGE_SIZE };
