import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type {
  CandidatePeerSearchParams,
  CandidatePeerSearchResult,
  CandidatePeerSearchCandidate,
} from "@/lib/candidate/candidate-peer-search.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcCandidateRow = {
  id: string;
  vodora_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  city: string | null;
  country: string | null;
  profile_picture_url: string | null;
  availability_status: string;
  availability_start: string | null;
  total_years_experience: number | null;
  category: string | null;
  work_types: string[] | null;
  skills: string[] | null;
  verified: boolean;
  reference_count: number;
  connection_status?: string | null;
};

type RpcSearchResponse = {
  total_count?: number;
  candidates?: RpcCandidateRow[];
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function normalizeConnectionStatus(
  value: string | null | undefined,
): ConnectionStatus | null {
  if (value === "connected" || value === "pending") {
    return value;
  }

  return null;
}

function normalizeCandidate(row: RpcCandidateRow): CandidatePeerSearchCandidate {
  return {
    id: row.id,
    vodoraId: row.vodora_id,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    city: row.city,
    country: row.country,
    profilePictureUrl: row.profile_picture_url,
    availabilityStatus: row.availability_status,
    availabilityStart: row.availability_start,
    workTypes: row.work_types ?? [],
    skills: row.skills ?? [],
    verified: row.verified,
    referenceCount: row.reference_count,
    category: row.category,
    totalYearsExperience: row.total_years_experience,
    connectionStatus: normalizeConnectionStatus(row.connection_status),
  };
}

export async function searchCandidatesForCandidates(
  supabase: Supabase,
  params: CandidatePeerSearchParams,
): Promise<CandidatePeerSearchResult> {
  const limit = Math.min(
    Math.max(params.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const page = Math.max(params.page ?? 1, 1);
  const offset = (page - 1) * limit;

  const { data, error } = await supabase.rpc("search_candidates_for_candidates", {
    p_query: params.query?.trim() || undefined,
    p_category_id: params.categoryId || undefined,
    p_availability_start: params.availabilityStart || undefined,
    p_availability_status: params.availabilityStatus || undefined,
    p_work_type_codes:
      params.workTypeCodes && params.workTypeCodes.length > 0
        ? params.workTypeCodes
        : undefined,
    p_country: params.country && params.country !== "All" ? params.country : undefined,
    p_experience_min: params.experienceMin,
    p_experience_max: params.experienceMax,
    p_min_references: params.minReferences,
    p_offset: offset,
    p_limit: limit,
  });

  if (error) {
    return {
      candidates: [],
      totalCount: 0,
      page,
      limit,
      totalPages: 0,
      error: error.message,
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcSearchResponse)
      : null;

  const totalCount = payload?.total_count ?? 0;
  const rows = Array.isArray(payload?.candidates) ? payload.candidates : [];

  return {
    candidates: rows
      .filter(
        (row): row is RpcCandidateRow =>
          Boolean(row && typeof row === "object" && "id" in row),
      )
      .map(normalizeCandidate),
    totalCount,
    page,
    limit,
    totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
    error: null,
  };
}
