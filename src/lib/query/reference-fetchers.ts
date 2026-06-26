import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";
import type { RecruiterInitiatedReferenceItem } from "@/lib/references/fetch-recruiter-initiated-references";

type CandidateReferencesResponse = {
  success: boolean;
  error?: string;
  references?: CandidateReferenceItem[];
};

type CancelReferenceResponse = {
  success: boolean;
  error?: string;
};

export async function fetchCandidateReferences(): Promise<CandidateReferenceItem[]> {
  const response = await fetch("/api/candidate/references");
  const result = (await response.json()) as CandidateReferencesResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to load references.");
  }

  return result.references ?? [];
}

export async function cancelCandidateReference(
  referenceId: string,
): Promise<void> {
  const response = await fetch(
    `/api/candidate/references?id=${encodeURIComponent(referenceId)}`,
    { method: "DELETE" },
  );
  const result = (await response.json()) as CancelReferenceResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to cancel reference request.");
  }
}

export async function fetchRecruiterCandidateReferences(
  vodoraId: string,
): Promise<CandidateReferenceItem[]> {
  const response = await fetch(
    `/api/recruiter/candidates/profile/${encodeURIComponent(vodoraId)}/references`,
  );
  const result = (await response.json()) as CandidateReferencesResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to load references.");
  }

  return result.references ?? [];
}

type RecruiterReferenceHistoryResponse = {
  success: boolean;
  error?: string;
  references?: RecruiterInitiatedReferenceItem[];
};

export async function fetchRecruiterReferenceHistory(): Promise<
  RecruiterInitiatedReferenceItem[]
> {
  const response = await fetch("/api/recruiter/references");
  const result = (await response.json()) as RecruiterReferenceHistoryResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Unable to load reference history.");
  }

  return result.references ?? [];
}
