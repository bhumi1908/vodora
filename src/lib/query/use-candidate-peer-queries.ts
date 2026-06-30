import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CandidatePeerSearchFilters } from "@/lib/candidate/candidate-peer-search.types";
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

export function useCandidatePeerSearchFiltersQuery(
  initialFilters?: CandidatePeerSearchFilters,
) {
  return useQuery({
    queryKey: candidatePeerKeys.filters(),
    queryFn: fetchCandidatePeerSearchFilters,
    initialData: initialFilters,
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: candidatePeerKeys.all });
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      void queryClient.invalidateQueries({
        queryKey: connectionKeys.peerProfileStatus(variables.candidateId),
      });
    },
  });
}
