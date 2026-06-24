import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapReferenceRpcRows,
  parseReferenceRpcRows,
  type ReferenceRpcRow,
} from "@/lib/references/map-reference-rpc-rows";
import type { Database } from "@/lib/supabase/database.types";

import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";

type Supabase = SupabaseClient<Database>;

export async function fetchRecruiterCandidateReferences(
  supabase: Supabase,
  candidateId: string,
): Promise<{ references: CandidateReferenceItem[]; error?: string }> {
  const { data, error } = await supabase.rpc("get_recruiter_candidate_references", {
    p_candidate_id: candidateId,
  });

  if (error) {
    console.error("fetchRecruiterCandidateReferences failed:", error);
    return {
      references: [],
      error: "Unable to load references.",
    };
  }

  return {
    references: mapReferenceRpcRows(parseReferenceRpcRows(data) as ReferenceRpcRow[]),
  };
}
