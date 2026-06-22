import type { ConnectionTab } from "@/lib/connections/connection.types";

export const CONNECTION_PAGE_SIZE = 10;

export const connectionKeys = {
  all: ["connections"] as const,
  counts: (role: "candidate" | "recruiter") =>
    [...connectionKeys.all, "counts", role] as const,
  list: (
    role: "candidate" | "recruiter",
    tab: ConnectionTab,
    page: number,
    limit: number,
  ) => [...connectionKeys.all, "list", role, tab, { page, limit }] as const,
  profileStatus: (candidateId: string) =>
    [...connectionKeys.all, "profile-status", candidateId] as const,
};
