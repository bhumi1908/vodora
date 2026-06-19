import type { RecruiterDashboardData } from "@/lib/recruiter/dashboard.types";
import type { OwnRecruiterProfileRpcResult } from "@/lib/recruiter/own-recruiter-profile-rpc.types";
import type {
  RecruiterSearchFilters,
  RecruiterSearchResult,
} from "@/lib/recruiter/search.types";
import type { CandidateProfileData } from "@/lib/profile/types";

export const RECRUITER_SEARCH_PAGE_SIZE = 10;
export const RECRUITER_SAVED_PAGE_SIZE = 10;

export type RecruiterSearchQueryParams = {
  query: string;
  categoryId: string;
  availability: string;
  workTypeCodes: string[];
  country: string;
  experience: string;
  references: string;
  page: number;
  limit?: number;
};

type ApiSuccess<T> = T & { success?: boolean; error?: string };

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function buildRecruiterSearchUrl(
  params: RecruiterSearchQueryParams,
): string {
  const limit = params.limit ?? RECRUITER_SEARCH_PAGE_SIZE;
  const searchParams = new URLSearchParams();

  if (params.query.trim()) {
    searchParams.set("q", params.query.trim());
  }

  if (params.categoryId) {
    searchParams.set("categoryId", params.categoryId);
  }

  if (params.availability !== "All") {
    searchParams.set("availability", params.availability);
  }

  for (const code of params.workTypeCodes) {
    searchParams.append("workType", code);
  }

  if (params.country !== "All") {
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

  const queryString = searchParams.toString();
  return queryString
    ? `/api/recruiter/candidates/search?${queryString}`
    : `/api/recruiter/candidates/search?limit=${limit}`;
}

export async function fetchRecruiterSearchResults(
  params: RecruiterSearchQueryParams,
): Promise<RecruiterSearchResult> {
  const response = await fetch(buildRecruiterSearchUrl(params));
  const payload = await parseJson<
    RecruiterSearchResult & ApiSuccess<RecruiterSearchResult>
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

export async function fetchRecruiterSavedCandidates(
  page: number,
  limit = RECRUITER_SAVED_PAGE_SIZE,
): Promise<RecruiterSearchResult> {
  const response = await fetch(
    `/api/recruiter/candidates/saved?page=${page}&limit=${limit}`,
  );
  const payload = await parseJson<
    RecruiterSearchResult & ApiSuccess<RecruiterSearchResult>
  >(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load saved candidates.");
  }

  return {
    candidates: payload.candidates ?? [],
    totalCount: payload.totalCount ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    totalPages: payload.totalPages ?? 0,
  };
}

export async function fetchRecruiterOwnProfile(): Promise<OwnRecruiterProfileRpcResult> {
  const response = await fetch("/api/recruiter/profile/own");
  const payload = await parseJson<
    { profile: OwnRecruiterProfileRpcResult } & ApiSuccess<{
      profile: OwnRecruiterProfileRpcResult;
    }>
  >(response);

  if (!response.ok || !payload.success || !payload.profile) {
    throw new Error(payload.error ?? "Could not load recruiter profile.");
  }

  return payload.profile;
}

export async function fetchRecruiterDashboardData(): Promise<RecruiterDashboardData> {
  const response = await fetch("/api/recruiter/dashboard");
  const payload = await parseJson<
    RecruiterDashboardData & ApiSuccess<RecruiterDashboardData>
  >(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load dashboard.");
  }

  return {
    context: payload.context,
    candidates: payload.candidates,
    candidatesError: payload.candidatesError,
    savedCount: payload.savedCount,
  };
}

export async function fetchRecruiterSearchFilters(): Promise<RecruiterSearchFilters> {
  const response = await fetch("/api/recruiter/search/filters");
  const payload = await parseJson<
    RecruiterSearchFilters & ApiSuccess<RecruiterSearchFilters>
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

export async function fetchRecruiterCandidateProfile(
  vodoraId: string,
): Promise<CandidateProfileData> {
  const response = await fetch(
    `/api/recruiter/candidates/profile/${encodeURIComponent(vodoraId)}`,
  );
  const payload = await parseJson<
    { profile: CandidateProfileData } & ApiSuccess<{ profile: CandidateProfileData }>
  >(response);

  if (!response.ok || !payload.success || !payload.profile) {
    throw new Error(payload.error ?? "Could not load candidate profile.");
  }

  return payload.profile;
}

export async function toggleRecruiterCandidateSave(
  candidateId: string,
): Promise<{ saved: boolean }> {
  const response = await fetch(
    `/api/recruiter/candidates/${encodeURIComponent(candidateId)}/save`,
    { method: "POST" },
  );
  const payload = await parseJson<
    ApiSuccess<{ saved?: boolean }>
  >(response);

  if (!response.ok || !payload.success) {
    throw new Error("Could not update saved status.");
  }

  return { saved: payload.saved ?? false };
}
