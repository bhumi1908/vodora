import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  RecruiterSearchCandidate,
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

type RpcSavedResponse = {
  total_count?: number;
  candidates?: RpcCandidateRow[];
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

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
    isSaved: row.is_saved ?? true,
    category: row.category,
    totalYearsExperience: row.total_years_experience,
    connectionStatus: null,
  };
}

export async function fetchRecruiterSavedCandidates(
  supabase: Supabase,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<RecruiterSearchResult> {
  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const safePage = Math.max(page, 1);
  const offset = (safePage - 1) * safeLimit;

  const { data, error } = await supabase.rpc("get_recruiter_saved_candidates", {
    p_offset: offset,
    p_limit: safeLimit,
  });

  if (error) {
    return {
      candidates: [],
      totalCount: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 0,
      error: error.message,
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcSavedResponse)
      : null;

  const totalCount = payload?.total_count ?? 0;
  const rows = Array.isArray(payload?.candidates) ? payload.candidates : [];

  return {
    candidates: rows
      .filter((row): row is RpcCandidateRow =>
        Boolean(row && typeof row === "object" && "id" in row),
      )
      .map(normalizeCandidate),
    totalCount,
    page: safePage,
    limit: safeLimit,
    totalPages: totalCount > 0 ? Math.ceil(totalCount / safeLimit) : 0,
    error: null,
  };
}

export async function fetchRecruiterSavedCount(
  supabase: Supabase,
): Promise<number> {
  const { data, error } = await supabase.rpc("get_recruiter_saved_count");

  if (error || data === null || data === undefined) {
    return 0;
  }

  return data;
}
