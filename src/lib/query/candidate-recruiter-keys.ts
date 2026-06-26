import type { RecruiterDirectorySearchParams } from "@/lib/recruiter/recruiter-directory.types";
import { RECRUITER_DIRECTORY_PAGE_SIZE } from "@/lib/recruiter/recruiter-directory-options";

export type RecruiterDirectoryQueryParams = {
  query: string;
  specialisation: string;
  page: number;
  limit?: number;
};

export const candidateRecruiterKeys = {
  all: ["candidate-recruiters"] as const,
  filters: () => [...candidateRecruiterKeys.all, "filters"] as const,
  list: (params: RecruiterDirectoryQueryParams) =>
    [...candidateRecruiterKeys.all, "list", params] as const,
  profile: (recruiterId: string) =>
    [...candidateRecruiterKeys.all, "profile", recruiterId] as const,
};

export function buildRecruiterDirectorySearchParams(
  params: RecruiterDirectoryQueryParams,
): RecruiterDirectorySearchParams {
  return {
    query: params.query,
    specialisation: params.specialisation,
    page: params.page,
    limit: params.limit ?? RECRUITER_DIRECTORY_PAGE_SIZE,
  };
}
