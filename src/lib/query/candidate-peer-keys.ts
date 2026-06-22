import type { CandidatePeerSearchParams } from "@/lib/candidate/candidate-peer-search.types";

export const CANDIDATE_PEER_SEARCH_PAGE_SIZE = 10;

export const candidatePeerKeys = {
  all: ["candidate-peer"] as const,
  filters: () => [...candidatePeerKeys.all, "filters"] as const,
  search: (params: CandidatePeerSearchQueryParams) =>
    [...candidatePeerKeys.all, "search", params] as const,
};

export type CandidatePeerSearchQueryParams = CandidatePeerSearchParams & {
  availability: string;
  experience: string;
  references: string;
  page: number;
  limit?: number;
};
