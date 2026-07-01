import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ConnectionTab } from "@/lib/connections/connection.types";
import {
  fetchCandidateConnectionList,
  fetchCandidatePeerConnectionStatus,
  fetchCandidateRecruiterConnectionStatus,
  fetchConnectionCounts,
  fetchRecruiterCandidateConnectionStatus,
  fetchRecruiterConnectionList,
  respondToConnection,
  sendRecruiterToCandidateConnection,
} from "@/lib/query/connection-fetchers";
import {
  CONNECTION_PAGE_SIZE,
  connectionKeys,
} from "@/lib/query/connection-keys";

export function useConnectionCountsQuery(role: "candidate" | "recruiter") {
  return useQuery({
    queryKey: connectionKeys.counts(role),
    queryFn: () => fetchConnectionCounts(role),
  });
}

export function useCandidateConnectionsQuery(
  tab: ConnectionTab,
  page: number,
  enabled = true,
  limit = CONNECTION_PAGE_SIZE,
) {
  return useQuery({
    queryKey: connectionKeys.list("candidate", tab, page, limit),
    queryFn: () => fetchCandidateConnectionList(tab, page, limit),
    enabled,
  });
}

export function useRecruiterConnectionsQuery(
  tab: ConnectionTab,
  page: number,
  enabled = true,
) {
  return useQuery({
    queryKey: connectionKeys.list("recruiter", tab, page, CONNECTION_PAGE_SIZE),
    queryFn: () => fetchRecruiterConnectionList(tab, page, CONNECTION_PAGE_SIZE),
    enabled,
  });
}

export function useRecruiterCandidateConnectionStatusQuery(
  candidateId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: connectionKeys.profileStatus(candidateId ?? ""),
    queryFn: () => fetchRecruiterCandidateConnectionStatus(candidateId!),
    enabled: Boolean(candidateId) && enabled,
  });
}

export function useCandidatePeerConnectionStatusQuery(
  candidateId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: connectionKeys.peerProfileStatus(candidateId ?? ""),
    queryFn: () => fetchCandidatePeerConnectionStatus(candidateId!),
    enabled: Boolean(candidateId) && enabled,
  });
}

export function useCandidateRecruiterConnectionStatusQuery(
  recruiterId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: connectionKeys.recruiterProfileStatus(recruiterId ?? ""),
    queryFn: () => fetchCandidateRecruiterConnectionStatus(recruiterId!),
    enabled: Boolean(recruiterId) && enabled,
  });
}

export function useRespondToConnectionMutation(role: "candidate" | "recruiter") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      connectionId,
      action,
    }: {
      connectionId: string;
      action: "accept" | "reject";
    }) => respondToConnection(role, connectionId, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}

export function useRecruiterConnectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateId,
      message,
    }: {
      candidateId: string;
      message?: string;
    }) => sendRecruiterToCandidateConnection(candidateId, message),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      void queryClient.invalidateQueries({
        queryKey: connectionKeys.profileStatus(variables.candidateId),
      });
    },
  });
}
