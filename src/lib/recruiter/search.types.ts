import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type { RecruiterDashboardCandidate } from "@/lib/recruiter/dashboard.types";

export type RecruiterSearchCandidate = RecruiterDashboardCandidate & {
  category: string | null;
  totalYearsExperience: number | null;
  connectionStatus: ConnectionStatus | null;
};

export type RecruiterSearchFilters = {
  categories: { id: string; name: string }[];
  workTypes: { code: string; name: string }[];
  countries: string[];
  totalDirectoryCount: number;
};

export type RecruiterSearchParams = {
  query?: string;
  categoryId?: string;
  availabilityStart?: string;
  availabilityStatus?: string;
  workTypeCodes?: string[];
  country?: string;
  experienceMin?: number;
  experienceMax?: number;
  minReferences?: number;
  page?: number;
  limit?: number;
};

export type RecruiterSearchResult = {
  candidates: RecruiterSearchCandidate[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string | null;
};
