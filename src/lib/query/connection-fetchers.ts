import type {
  CandidateConnectionEntry,
  ConnectionCounts,
  ConnectionListResult,
  ConnectionTab,
  ProfileConnectionState,
  RecruiterConnectionEntry,
} from "@/lib/connections/connection.types";
import { CONNECTION_PAGE_SIZE } from "@/lib/query/connection-keys";

type ApiListResponse<T> = {
  success: boolean;
  error?: string;
  connections?: T[];
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

type ApiCountsResponse = {
  success: boolean;
  error?: string;
  counts?: ConnectionCounts;
};

type ApiStatusResponse = {
  success: boolean;
  error?: string;
  connection?: ProfileConnectionState;
};

type ApiRespondResponse = {
  success: boolean;
  error?: string;
  id?: string;
  status?: string;
  action?: "accept" | "reject";
};

type ApiSendResponse = {
  success: boolean;
  error?: string;
  id?: string;
  status?: "pending" | "connected";
  alreadyExists?: boolean;
};

function buildListUrl(
  role: "candidate" | "recruiter",
  tab: ConnectionTab,
  page: number,
  limit: number,
): string {
  const params = new URLSearchParams({
    tab,
    page: String(page),
    limit: String(limit),
  });

  return `/api/${role}/connections?${params.toString()}`;
}

export async function fetchConnectionCounts(
  role: "candidate" | "recruiter",
): Promise<ConnectionCounts> {
  const response = await fetch(`/api/${role}/connections/counts`);
  const payload = (await response.json()) as ApiCountsResponse;

  if (!response.ok || !payload.success || !payload.counts) {
    throw new Error(payload.error ?? "Could not load connection counts.");
  }

  return payload.counts;
}

export async function fetchCandidateConnectionList(
  tab: ConnectionTab,
  page: number,
  limit = CONNECTION_PAGE_SIZE,
): Promise<ConnectionListResult<CandidateConnectionEntry>> {
  const response = await fetch(buildListUrl("candidate", tab, page, limit));
  const payload = (await response.json()) as ApiListResponse<CandidateConnectionEntry>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load connections.");
  }

  return {
    connections: payload.connections ?? [],
    totalCount: payload.totalCount ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    totalPages: payload.totalPages ?? 0,
    error: null,
  };
}

export async function fetchRecruiterConnectionList(
  tab: ConnectionTab,
  page: number,
  limit = CONNECTION_PAGE_SIZE,
): Promise<ConnectionListResult<RecruiterConnectionEntry>> {
  const response = await fetch(buildListUrl("recruiter", tab, page, limit));
  const payload = (await response.json()) as ApiListResponse<RecruiterConnectionEntry>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load connections.");
  }

  return {
    connections: payload.connections ?? [],
    totalCount: payload.totalCount ?? 0,
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    totalPages: payload.totalPages ?? 0,
    error: null,
  };
}

export async function respondToConnection(
  role: "candidate" | "recruiter",
  connectionId: string,
  action: "accept" | "reject",
): Promise<{ id: string; status: string; action: "accept" | "reject" }> {
  const response = await fetch(`/api/${role}/connections/${connectionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });
  const payload = (await response.json()) as ApiRespondResponse;

  if (!response.ok || !payload.success || !payload.id) {
    throw new Error(payload.error ?? "Could not update connection request.");
  }

  return {
    id: payload.id,
    status: payload.status ?? "pending",
    action: payload.action ?? action,
  };
}

export async function sendCandidateToRecruiterConnection(
  recruiterId: string,
  message?: string,
): Promise<{ id: string; status: "pending" | "connected"; alreadyExists: boolean }> {
  const response = await fetch(`/api/candidate/recruiters/${recruiterId}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
  const payload = (await response.json()) as ApiSendResponse;

  if (!response.ok || !payload.success || !payload.id || !payload.status) {
    throw new Error(payload.error ?? "Could not send connection request.");
  }

  return {
    id: payload.id,
    status: payload.status,
    alreadyExists: payload.alreadyExists ?? false,
  };
}

export async function sendCandidateToCandidateConnection(
  candidateId: string,
  message?: string,
): Promise<{ id: string; status: "pending" | "connected"; alreadyExists: boolean }> {
  const response = await fetch(`/api/candidate/candidates/${candidateId}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
  const payload = (await response.json()) as ApiSendResponse;

  if (!response.ok || !payload.success || !payload.id || !payload.status) {
    throw new Error(payload.error ?? "Could not send connection request.");
  }

  return {
    id: payload.id,
    status: payload.status,
    alreadyExists: payload.alreadyExists ?? false,
  };
}

export async function sendRecruiterToRecruiterConnection(
  recruiterId: string,
  message?: string,
): Promise<{ id: string; status: "pending" | "connected"; alreadyExists: boolean }> {
  const response = await fetch(`/api/recruiter/recruiters/${recruiterId}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
  const payload = (await response.json()) as ApiSendResponse;

  if (!response.ok || !payload.success || !payload.id || !payload.status) {
    throw new Error(payload.error ?? "Could not send connection request.");
  }

  return {
    id: payload.id,
    status: payload.status,
    alreadyExists: payload.alreadyExists ?? false,
  };
}

export async function sendRecruiterToCandidateConnection(
  candidateId: string,
  message?: string,
): Promise<{ id: string; status: "pending" | "connected"; alreadyExists: boolean }> {
  const response = await fetch(`/api/recruiter/candidates/${candidateId}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
  const payload = (await response.json()) as ApiSendResponse;

  if (!response.ok || !payload.success || !payload.id || !payload.status) {
    throw new Error(payload.error ?? "Could not send connection request.");
  }

  return {
    id: payload.id,
    status: payload.status,
    alreadyExists: payload.alreadyExists ?? false,
  };
}

export async function fetchRecruiterCandidateConnectionStatus(
  candidateId: string,
): Promise<ProfileConnectionState> {
  const response = await fetch(
    `/api/recruiter/candidates/${candidateId}/connection-status`,
  );
  const payload = (await response.json()) as ApiStatusResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load connection status.");
  }

  return payload.connection ?? null;
}

export async function fetchCandidatePeerConnectionStatus(
  candidateId: string,
): Promise<ProfileConnectionState> {
  const response = await fetch(
    `/api/candidate/candidates/${candidateId}/connection-status`,
  );
  const payload = (await response.json()) as ApiStatusResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load connection status.");
  }

  return payload.connection ?? null;
}

export async function fetchCandidateRecruiterConnectionStatus(
  recruiterId: string,
): Promise<ProfileConnectionState> {
  const response = await fetch(
    `/api/candidate/recruiters/${encodeURIComponent(recruiterId)}/connection-status`,
  );
  const payload = (await response.json()) as ApiStatusResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load connection status.");
  }

  return payload.connection ?? null;
}
