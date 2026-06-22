import type {
  CandidatePeerSearchFilters,
  CandidatePeerSearchResult,
} from "@/lib/candidate/candidate-peer-search.types";
import {
  CANDIDATE_PEER_SEARCH_PAGE_SIZE,
  type CandidatePeerSearchQueryParams,
} from "@/lib/query/candidate-peer-keys";

type ApiSuccess<T> = T & { success?: boolean; error?: string };

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function buildCandidatePeerSearchUrl(
  params: CandidatePeerSearchQueryParams,
): string {
  const limit = params.limit ?? CANDIDATE_PEER_SEARCH_PAGE_SIZE;
  const searchParams = new URLSearchParams();

  if (params.query?.trim()) {
    searchParams.set("q", params.query.trim());
  }

  if (params.categoryId) {
    searchParams.set("categoryId", params.categoryId);
  }

  if (params.availability !== "All") {
    searchParams.set("availability", params.availability);
  }

  for (const code of params.workTypeCodes ?? []) {
    searchParams.append("workType", code);
  }

  if (params.country && params.country !== "All") {
    searchParams.set("country", params.country);
  }

  if (params.experience !== "Any") {
    searchParams.set("experience", params.experience);
  }

  if (params.references !== "Any") {
    searchParams.set("references", params.references);
  }

  if (params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  searchParams.set("limit", String(limit));

  return `/api/candidate/candidates/search?${searchParams.toString()}`;
}

export async function fetchCandidatePeerSearchResults(
  params: CandidatePeerSearchQueryParams,
): Promise<CandidatePeerSearchResult> {
  const response = await fetch(buildCandidatePeerSearchUrl(params));
  const payload = await parseJson<
    CandidatePeerSearchResult & ApiSuccess<CandidatePeerSearchResult>
  >(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load candidates.");
  }

  return {
    candidates: payload.candidates,
    totalCount: payload.totalCount,
    page: payload.page,
    limit: payload.limit,
    totalPages: payload.totalPages,
  };
}

export async function fetchCandidatePeerSearchFilters(): Promise<CandidatePeerSearchFilters> {
  const response = await fetch("/api/candidate/candidates/filters");
  const payload = await parseJson<
    CandidatePeerSearchFilters & ApiSuccess<CandidatePeerSearchFilters>
  >(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load search filters.");
  }

  return {
    categories: payload.categories,
    workTypes: payload.workTypes,
    countries: payload.countries,
    totalDirectoryCount: payload.totalDirectoryCount,
  };
}

export async function sendCandidatePeerConnectionRequest(
  candidateId: string,
  message?: string,
): Promise<void> {
  const response = await fetch(`/api/candidate/candidates/${candidateId}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
  const payload = await parseJson<{ success?: boolean; error?: string }>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not send connection request.");
  }
}
