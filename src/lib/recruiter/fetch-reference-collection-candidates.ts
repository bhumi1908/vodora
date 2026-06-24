import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchRecruiterCandidateProfile } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
import { searchRecruiterCandidates } from "@/lib/recruiter/fetch-recruiter-candidate-search";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type ReferenceCollectionCandidateOption = {
  candidateId: string;
  vodoraId: string;
  name: string;
  title: string | null;
};

export type ReferenceCollectionCandidateDetails = {
  candidateId: string;
  vodoraId: string;
  name: string;
  title: string | null;
  company: string | null;
  email: string;
};

const CANDIDATE_LIST_LIMIT = 50;
const SEARCH_PAGE_LIMIT = 50;
const MAX_SEARCH_PAGES = 10;

type RpcCandidateDetailsRow = {
  candidate_id: string;
  vodora_id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string | null;
  company: string | null;
};

function normalizeRpcCandidateDetails(
  data: unknown,
): ReferenceCollectionCandidateDetails | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const row = data as Partial<RpcCandidateDetailsRow>;

  if (
    !row.candidate_id ||
    !row.vodora_id ||
    !row.first_name ||
    !row.last_name ||
    !row.email?.trim()
  ) {
    return null;
  }

  return {
    candidateId: row.candidate_id,
    vodoraId: row.vodora_id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    title: row.title ?? null,
    company: row.company ?? null,
    email: row.email.trim(),
  };
}

async function fetchReferenceCollectionCandidateDetailsFromRpc(
  supabase: Supabase,
  candidateId: string,
): Promise<ReferenceCollectionCandidateDetails | null> {
  const { data, error } = await supabase.rpc(
    "get_reference_collection_candidate_details",
    {
      p_candidate_id: candidateId,
    },
  );

  if (error) {
    if (error.code === "PGRST202") {
      return null;
    }

    console.error("get_reference_collection_candidate_details failed:", error);
    return null;
  }

  return normalizeRpcCandidateDetails(data);
}

async function resolveVerifiedCandidateVodoraId(
  supabase: Supabase,
  candidateId: string,
  preferredVodoraId?: string,
): Promise<string | null> {
  if (preferredVodoraId?.trim()) {
    return preferredVodoraId.trim();
  }

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= MAX_SEARCH_PAGES) {
    const result = await searchRecruiterCandidates(supabase, {
      limit: SEARCH_PAGE_LIMIT,
      page,
    });

    if (result.error) {
      return null;
    }

    totalPages = result.totalPages;

    const match = result.candidates.find(
      (candidate) => candidate.id === candidateId && candidate.verified,
    );

    if (match) {
      return match.vodoraId;
    }

    page += 1;
  }

  return null;
}

async function fetchReferenceCollectionCandidateDetailsFromProfile(
  supabase: Supabase,
  candidateId: string,
  preferredVodoraId?: string,
): Promise<ReferenceCollectionCandidateDetails | null> {
  const vodoraId = await resolveVerifiedCandidateVodoraId(
    supabase,
    candidateId,
    preferredVodoraId,
  );

  if (!vodoraId) {
    return null;
  }

  const profile = await fetchRecruiterCandidateProfile(supabase, vodoraId);

  if (!profile?.candidateId || profile.candidateId !== candidateId) {
    return null;
  }

  if (!profile.email?.trim()) {
    return null;
  }

  return {
    candidateId: profile.candidateId,
    vodoraId: profile.vodoraId ?? vodoraId,
    name: profile.name,
    title: profile.title,
    company: profile.company,
    email: profile.email.trim(),
  };
}

export async function fetchReferenceCollectionCandidateOptions(
  supabase: Supabase,
): Promise<{ candidates: ReferenceCollectionCandidateOption[]; error?: string }> {
  const result = await searchRecruiterCandidates(supabase, {
    limit: CANDIDATE_LIST_LIMIT,
    page: 1,
  });

  if (result.error) {
    return { candidates: [], error: result.error };
  }

  const candidates = result.candidates
    .filter((candidate) => candidate.verified)
    .map((candidate) => ({
      candidateId: candidate.id,
      vodoraId: candidate.vodoraId,
      name: `${candidate.firstName} ${candidate.lastName}`.trim(),
      title: candidate.title,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return { candidates };
}

export async function fetchReferenceCollectionCandidateDetails(
  supabase: Supabase,
  candidateId: string,
  options?: { vodoraId?: string },
): Promise<{ candidate: ReferenceCollectionCandidateDetails | null; error?: string }> {
  const fromRpc = await fetchReferenceCollectionCandidateDetailsFromRpc(
    supabase,
    candidateId,
  );

  if (fromRpc) {
    return { candidate: fromRpc };
  }

  const fromProfile = await fetchReferenceCollectionCandidateDetailsFromProfile(
    supabase,
    candidateId,
    options?.vodoraId,
  );

  if (fromProfile) {
    return { candidate: fromProfile };
  }

  return { candidate: null, error: "Candidate not found." };
}
