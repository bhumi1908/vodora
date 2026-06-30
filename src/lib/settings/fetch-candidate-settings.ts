import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_CANDIDATE_VISIBILITY,
  isCandidateVisibility,
  type CandidateVisibility,
} from "@/lib/settings/candidate-visibility";
import { requireOwnCandidate } from "@/lib/profile/require-own-candidate";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type CandidateSettingsData = {
  visibility: CandidateVisibility;
  defaultCoverLetter: string;
};

function normalizeVisibility(value: string | null | undefined): CandidateVisibility {
  if (value && isCandidateVisibility(value)) {
    return value;
  }

  return DEFAULT_CANDIDATE_VISIBILITY;
}

export async function fetchCandidateSettings(
  supabase: Supabase,
): Promise<CandidateSettingsData | null> {
  const context = await requireOwnCandidate(supabase);

  if (!context) {
    return null;
  }

  const { data, error } = await supabase
    .from("candidates")
    .select("visibility, default_cover_letter")
    .eq("id", context.candidateId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    visibility: normalizeVisibility(data.visibility),
    defaultCoverLetter: data.default_cover_letter?.trim() ?? "",
  };
}
