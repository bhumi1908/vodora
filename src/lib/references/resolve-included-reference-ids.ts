import type { SupabaseClient } from "@supabase/supabase-js";

import type { ReferenceShareType } from "@/lib/references/reference-grant-defaults";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type ResolvedReferenceShare = {
  shareType: ReferenceShareType;
  includedReferenceIds: string[];
  referencesAttached: boolean;
  error?: string;
};

export async function resolveIncludedReferenceIds(
  supabase: Supabase,
  candidateId: string,
  referencesAttached: boolean,
  requestedIds?: string[] | null,
): Promise<ResolvedReferenceShare> {
  if (!referencesAttached) {
    return {
      shareType: "full_passport",
      includedReferenceIds: [],
      referencesAttached: false,
    };
  }

  const { data: verifiedRows, error } = await supabase
    .from("reference_requests")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("status", "verified");

  if (error) {
    return {
      shareType: "full_passport",
      includedReferenceIds: [],
      referencesAttached: true,
      error: error.message,
    };
  }

  const verifiedIds = new Set((verifiedRows ?? []).map((row) => row.id));

  if (verifiedIds.size === 0) {
    return {
      shareType: "full_passport",
      includedReferenceIds: [],
      referencesAttached: true,
      error: "Add at least one verified reference before sharing.",
    };
  }

  const requested = (requestedIds ?? []).filter(Boolean);

  if (requested.length === 0) {
    return {
      shareType: "full_passport",
      includedReferenceIds: [],
      referencesAttached: true,
    };
  }

  const includedReferenceIds = requested.filter((id) => verifiedIds.has(id));

  if (includedReferenceIds.length === 0) {
    return {
      shareType: "selected_references",
      includedReferenceIds: [],
      referencesAttached: true,
      error: "Select at least one verified reference to share.",
    };
  }

  return {
    shareType: "selected_references",
    includedReferenceIds,
    referencesAttached: true,
  };
}
