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

export function useRecruiterDirectoryQuery(params: RecruiterDirectoryQueryParams) {
  return useQuery({
    queryKey: candidateRecruiterKeys.list(params),
    queryFn: () => fetchRecruiterDirectory(params),
    staleTime: STALE_TIME_MS,
    placeholderData: (previous) => previous,
  });
}
