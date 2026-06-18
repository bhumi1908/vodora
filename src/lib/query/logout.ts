import type { QueryClient } from "@tanstack/react-query";

export function clearQueryCacheOnLogout(queryClient: QueryClient) {
  queryClient.clear();
}
