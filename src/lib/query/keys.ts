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

export type PublishedJobsQueryParams = {
  category: string;
  workTypes: string[];
  location: string;
  query: string;
  page: number;
  limit?: number;
};

export const jobKeys = {
  all: ["jobs"] as const,
  published: (params: PublishedJobsQueryParams) =>
    [...jobKeys.all, "published", params] as const,
  detail: (jobId: string) => [...jobKeys.all, "detail", jobId] as const,
  recruiter: () => [...jobKeys.all, "recruiter"] as const,
};
