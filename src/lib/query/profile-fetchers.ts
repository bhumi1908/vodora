import type { OwnCandidateProfileRpcResult } from "@/lib/profile/own-candidate-profile-rpc.types";

type ApiSuccess<T> = T & { success?: boolean; error?: string };

export async function fetchOwnCandidateProfile(): Promise<OwnCandidateProfileRpcResult> {
  const response = await fetch("/api/profile/own");
  const payload = (await response.json()) as ApiSuccess<{
    profile: OwnCandidateProfileRpcResult;
  }>;

  if (!response.ok || !payload.success || !payload.profile) {
    throw new Error(payload.error ?? "Could not load profile.");
  }

  return payload.profile;
}
