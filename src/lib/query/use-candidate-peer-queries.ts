import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCandidatePeerSearchFilters,
  fetchCandidatePeerSearchResults,
  sendCandidatePeerConnectionRequest,
} from "@/lib/query/candidate-peer-fetchers";
import {
  candidatePeerKeys,
  type CandidatePeerSearchQueryParams,
} from "@/lib/query/candidate-peer-keys";
import { connectionKeys } from "@/lib/query/connection-keys";

export function useCandidatePeerSearchFiltersQuery() {
  return useQuery({
    queryKey: candidatePeerKeys.filters(),
    queryFn: fetchCandidatePeerSearchFilters,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCandidatePeerSearchQuery(params: CandidatePeerSearchQueryParams) {
  return useQuery({
    queryKey: candidatePeerKeys.search(params),
    queryFn: () => fetchCandidatePeerSearchResults(params),
  });
}

export function useCandidatePeerConnectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateId,
      message,
    }: {
      candidateId: string;
      message?: string;
    }) => sendCandidatePeerConnectionRequest(candidateId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: candidatePeerKeys.all });
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}
