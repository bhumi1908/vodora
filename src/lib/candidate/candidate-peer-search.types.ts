import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type { RecruiterSearchFilters } from "@/lib/recruiter/search.types";

export type CandidatePeerSearchFilters = RecruiterSearchFilters;

export type CandidatePeerSearchCandidate = {
  id: string;
  vodoraId: string;
  firstName: string;
  lastName: string;
  title: string | null;
  city: string | null;
  country: string | null;
  profilePictureUrl: string | null;
  availabilityStatus: string;
  availabilityStart: string | null;
  workTypes: string[];
  skills: string[];
  verified: boolean;
  referenceCount: number;
  category: string | null;
  totalYearsExperience: number | null;
  connectionStatus: ConnectionStatus | null;
};

export type CandidatePeerSearchParams = {
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

export type CandidatePeerSearchResult = {
  candidates: CandidatePeerSearchCandidate[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string | null;
};
