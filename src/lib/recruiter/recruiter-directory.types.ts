import type { ConnectionStatus } from "@/lib/connections/connection.types";

/** Active role summary shown on recruiter directory cards (maps to published job postings). */
export type RecruiterDirectoryActiveRole = {
  id: string;
  title: string;
  type: string;
  location: string;
  salary: string;
};

export type RecruiterDirectoryEntry = {
  id: string;
  userId: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  profilePictureUrl: string | null;
  placements: number;
  avgHire: string;
  verified: boolean;
  specialisations: string[];
  industries: string[];
  recruiterType: string | null;
  bio: string | null;
  activeRoles: RecruiterDirectoryActiveRole[];
  connectionStatus: ConnectionStatus | null;
};

export type RecruiterDirectorySearchParams = {
  query?: string;
  specialisation?: string;
  page?: number;
  limit?: number;
};

export type RecruiterDirectoryFilters = {
  specialisations: string[];
};

export type RecruiterDirectorySearchResult = {
  recruiters: RecruiterDirectoryEntry[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  error: string | null;
};
