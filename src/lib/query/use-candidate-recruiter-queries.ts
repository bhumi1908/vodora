import { useQuery } from "@tanstack/react-query";

import {
  fetchRecruiterDirectory,
  fetchRecruiterDirectoryFilters,
} from "@/lib/query/candidate-recruiter-fetchers";
import {
  candidateRecruiterKeys,
  type RecruiterDirectoryQueryParams,
} from "@/lib/query/candidate-recruiter-keys";

const STALE_TIME_MS = 60_000;

export function useRecruiterDirectoryFiltersQuery() {
  return useQuery({
    queryKey: candidateRecruiterKeys.filters(),
    queryFn: fetchRecruiterDirectoryFilters,
    staleTime: STALE_TIME_MS,
  });
}

export function useRecruiterDirectoryQuery(
  params: RecruiterDirectoryQueryParams & { enabled?: boolean },
) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: candidateRecruiterKeys.list(queryParams),
    queryFn: () => fetchRecruiterDirectory(queryParams),
    staleTime: STALE_TIME_MS,
    placeholderData: (previous) => previous,
    enabled,
  });
}
