import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchRecruiterCandidateConnectionStatus } from "@/lib/connections/fetch-recruiter-candidate-connection-status";
import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type {
  RecruiterSearchCandidate,
  RecruiterSearchParams,
  RecruiterSearchResult,
} from "@/lib/recruiter/search.types";
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
  is_saved?: boolean;
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

function normalizeCandidate(row: RpcCandidateRow): RecruiterSearchCandidate {
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
    isSaved: row.is_saved ?? false,
    category: row.category,
    totalYearsExperience: row.total_years_experience,
    connectionStatus: null,
  };
}

async function attachConnectionStatus(
  supabase: Supabase,
  candidate: RecruiterSearchCandidate,
): Promise<RecruiterSearchCandidate> {
  const connection = await fetchRecruiterCandidateConnectionStatus(
    supabase,
    candidate.id,
  );

  return {
    ...candidate,
    connectionStatus: normalizeConnectionStatus(connection?.status),
  };
}

export async function searchRecruiterCandidates(
  supabase: Supabase,
  params: RecruiterSearchParams,
): Promise<RecruiterSearchResult> {
  const limit = Math.min(
    Math.max(params.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const page = Math.max(params.page ?? 1, 1);
  const offset = (page - 1) * limit;

  const { data, error } = await supabase.rpc("search_recruiter_candidates", {
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
  const normalizedCandidates = rows
    .filter((row): row is RpcCandidateRow =>
      Boolean(row && typeof row === "object" && "id" in row),
    )
    .map(normalizeCandidate);
  const candidates = await Promise.all(
    normalizedCandidates.map((candidate) =>
      attachConnectionStatus(supabase, candidate),
    ),
  );

  return {
    candidates,
    totalCount,
    page,
    limit,
    totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
    error: null,
  };
}
