import { RECRUITER_DIRECTORY_PAGE_SIZE } from "@/lib/recruiter/recruiter-directory-options";
import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type { RecruiterDirectoryEntry } from "@/lib/recruiter/recruiter-directory.types";
import type { RecruiterDirectoryQueryParams } from "@/lib/query/candidate-recruiter-keys";

export type RecruiterDirectoryResponse = {
  success: boolean;
  error?: string;
  recruiters?: RecruiterDirectoryEntry[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

const EMPTY_RESULT = {
  recruiters: [] as RecruiterDirectoryEntry[],
  total: 0,
  page: 1,
  limit: RECRUITER_DIRECTORY_PAGE_SIZE,
  totalPages: 0,
};

export function buildRecruiterDirectoryUrl(
  params: RecruiterDirectoryQueryParams,
): string {
  const limit = params.limit ?? RECRUITER_DIRECTORY_PAGE_SIZE;
  const searchParams = new URLSearchParams();

  if (params.query.trim()) {
    searchParams.set("q", params.query.trim());
  }

  if (params.specialisation !== "All") {
    searchParams.set("specialisation", params.specialisation);
  }

  if (params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  searchParams.set("limit", String(limit));

  return `/api/candidate/recruiters?${searchParams.toString()}`;
}

export async function fetchRecruiterDirectory(
  params: RecruiterDirectoryQueryParams,
): Promise<typeof EMPTY_RESULT> {
  const response = await fetch(buildRecruiterDirectoryUrl(params));
  const payload = await response.json() as RecruiterDirectoryResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load recruiters.");
  }

  return {
    recruiters: payload.recruiters ?? [],
    total: payload.total ?? 0,
    page: payload.page ?? params.page,
    limit: payload.limit ?? params.limit ?? RECRUITER_DIRECTORY_PAGE_SIZE,
    totalPages: payload.totalPages ?? 0,
  };
}

export type RecruiterDirectoryFiltersResponse = {
  success: boolean;
  error?: string;
  specialisations?: string[];
};

export async function fetchRecruiterDirectoryFilters(): Promise<string[]> {
  const response = await fetch("/api/candidate/recruiters/filters");
  const payload = await response.json() as RecruiterDirectoryFiltersResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load recruiter filters.");
  }

  return payload.specialisations ?? [];
}

export type SendRecruiterConnectionResponse = {
  success: boolean;
  error?: string;
  id?: string;
  status?: ConnectionStatus;
  alreadyExists?: boolean;
};

export async function sendRecruiterConnectionRequest(
  recruiterId: string,
  message?: string,
): Promise<{
  id: string;
  status: ConnectionStatus;
  alreadyExists: boolean;
}> {
  const response = await fetch(`/api/candidate/recruiters/${recruiterId}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
  const payload = (await response.json()) as SendRecruiterConnectionResponse;

  if (!response.ok || !payload.success || !payload.id || !payload.status) {
    throw new Error(payload.error ?? "Could not send connection request.");
  }

  return {
    id: payload.id,
    status: payload.status,
    alreadyExists: payload.alreadyExists ?? false,
  };
}
