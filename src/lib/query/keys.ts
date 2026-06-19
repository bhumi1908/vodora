import type { RecruiterSearchQueryParams } from "@/lib/query/recruiter-fetchers";

export const recruiterKeys = {
  all: ["recruiter"] as const,
  ownProfile: () => [...recruiterKeys.all, "own-profile"] as const,
  dashboard: () => [...recruiterKeys.all, "dashboard"] as const,
  search: (params: RecruiterSearchQueryParams) =>
    [...recruiterKeys.all, "search", params] as const,
  saved: (page: number, limit: number) =>
    [...recruiterKeys.all, "saved", { page, limit }] as const,
  filters: () => [...recruiterKeys.all, "filters"] as const,
  candidateProfile: (vodoraId: string) =>
    [...recruiterKeys.all, "candidate", vodoraId] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  own: () => [...profileKeys.all, "own"] as const,
};
