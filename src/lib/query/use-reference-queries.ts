import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelCandidateReference,
  fetchCandidateReferences,
} from "@/lib/query/reference-fetchers";
import { referenceKeys } from "@/lib/query/reference-keys";

const STALE_TIME_MS = 60_000;

export function useCandidateReferencesQuery(enabled = true) {
  return useQuery({
    queryKey: referenceKeys.list(),
    queryFn: fetchCandidateReferences,
    staleTime: STALE_TIME_MS,
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useCancelReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelCandidateReference,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referenceKeys.all });
    },
  });
}

export function useInvalidateCandidateReferences() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: referenceKeys.all });
  };
}
