import type { QueryClient } from "@tanstack/react-query";

import { fetchNotificationCounts } from "@/lib/query/notification-fetchers";
import { notificationKeys } from "@/lib/query/notification-keys";

export async function syncNotificationQueries(queryClient: QueryClient) {
  try {
    const counts = await fetchNotificationCounts();
    queryClient.setQueryData(notificationKeys.counts(), counts);
  } catch {
    // Notifications API may be unavailable before migrations are applied.
  }

  await queryClient.invalidateQueries({
    queryKey: notificationKeys.all,
    refetchType: "active",
  });
}

export function scheduleNotificationSync(queryClient: QueryClient, delayMs = 300) {
  void syncNotificationQueries(queryClient);

  window.setTimeout(() => {
    void syncNotificationQueries(queryClient);
  }, delayMs);
}
