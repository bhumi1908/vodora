import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelCandidateReference,
  fetchCandidateReferences,
  fetchRecruiterCandidateReferences,
  fetchRecruiterReferenceHistory,
  resendCandidateReferenceInvitation,
  resendRecruiterReferenceInvitation,
} from "@/lib/query/reference-fetchers";
import {
  createReferencePassportShare,
  createReferenceRecruiterGrant,
  fetchReferencePassportShares,
  fetchReferenceShareGrants,
  openReferenceShareLink,
  revokeReferencePassportShare,
  revokeReferenceRecruiterGrant,
} from "@/lib/query/reference-share-fetchers";
import { referenceKeys } from "@/lib/query/reference-keys";
import type {
  CreateReferenceSharePayload,
  CreateReferenceRecruiterGrantPayload,
} from "@/lib/references/reference-passport-share.types";

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

export function useRecruiterCandidateReferencesQuery(
  vodoraId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: referenceKeys.recruiter(vodoraId ?? ""),
    queryFn: () => fetchRecruiterCandidateReferences(vodoraId ?? ""),
    staleTime: STALE_TIME_MS,
    enabled: enabled && Boolean(vodoraId),
    placeholderData: (previous) => previous,
  });
}

export function useRecruiterReferenceHistoryQuery(enabled = true) {
  return useQuery({
    queryKey: referenceKeys.recruiterHistory(),
    queryFn: fetchRecruiterReferenceHistory,
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

export function useResendReferenceInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendRecruiterReferenceInvitation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referenceKeys.all });
    },
  });
}

export function useResendCandidateReferenceInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendCandidateReferenceInvitation,
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

export function useReferencePassportSharesQuery(enabled = true) {
  return useQuery({
    queryKey: referenceKeys.shares(),
    queryFn: fetchReferencePassportShares,
    staleTime: STALE_TIME_MS,
    enabled,
  });
}

export function useCreateReferenceShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReferenceSharePayload) =>
      createReferencePassportShare(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referenceKeys.shares() });
    },
  });
}

export function useRevokeReferenceShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeReferencePassportShare,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referenceKeys.shares() });
    },
  });
}

export function useReferenceShareLinkQuery(token: string, enabled = true) {
  return useQuery({
    queryKey: referenceKeys.shareLink(token),
    queryFn: () => openReferenceShareLink(token),
    staleTime: STALE_TIME_MS,
    enabled: enabled && Boolean(token),
    retry: false,
  });
}

export function useReferenceShareGrantsQuery(enabled = true) {
  return useQuery({
    queryKey: referenceKeys.grants(),
    queryFn: fetchReferenceShareGrants,
    staleTime: STALE_TIME_MS,
    enabled,
  });
}

export function useCreateReferenceRecruiterGrantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReferenceRecruiterGrantPayload) =>
      createReferenceRecruiterGrant(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referenceKeys.grants() });
    },
  });
}

export function useRevokeReferenceRecruiterGrantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeReferenceRecruiterGrant,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referenceKeys.grants() });
    },
  });
}
