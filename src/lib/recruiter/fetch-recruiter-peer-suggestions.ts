import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchRecruiterPeerConnectionStatus } from "@/lib/connections/fetch-recruiter-peer-connection-status";
import { searchRecruitersForCandidates } from "@/lib/recruiter/fetch-candidate-recruiter-directory";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import type { RecruiterDirectoryEntry } from "@/lib/recruiter/recruiter-directory.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchRecruiterPeerSuggestions(
  supabase: Supabase,
  limit: number,
): Promise<{ recruiters: RecruiterDirectoryEntry[]; error: string | null }> {
  const ownRecruiter = await requireOwnRecruiter(supabase);

  if (!ownRecruiter) {
    return {
      recruiters: [],
      error: "Recruiter access required.",
    };
  }

  const result = await searchRecruitersForCandidates(supabase, {
    page: 1,
    limit,
  });

  if (result.error) {
    return {
      recruiters: [],
      error: result.error,
    };
  }

  const peers = result.recruiters.filter(
    (recruiter) => recruiter.id !== ownRecruiter.recruiterId,
  );

  const recruiters = await Promise.all(
    peers.map(async (recruiter) => {
      const connectionStatus = await fetchRecruiterPeerConnectionStatus(
        supabase,
        recruiter.id,
      );

      return {
        ...recruiter,
        connectionStatus,
      };
    }),
  );

  return {
    recruiters,
    error: null,
  };
}
