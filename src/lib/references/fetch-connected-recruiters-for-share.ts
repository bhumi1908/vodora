import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectedRecruiterShareOption } from "@/lib/references/reference-passport-share.types";
import { fetchCandidateConnections } from "@/lib/connections/fetch-candidate-connections";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function fetchConnectedRecruitersForShare(
  supabase: Supabase,
): Promise<{ recruiters: ConnectedRecruiterShareOption[]; error?: string }> {
  const result = await fetchCandidateConnections(supabase, "connected", 1, 100);

  if (result.error) {
    return { recruiters: [], error: result.error };
  }

  const recruiters = result.connections
    .filter(
      (connection) =>
        connection.connectionType === "candidate_recruiter" &&
        connection.status === "connected" &&
        connection.recruiterId,
    )
    .map((connection) => ({
      recruiterId: connection.recruiterId!,
      name: connection.name,
      company: connection.company,
      title: connection.title,
      profilePictureUrl: connection.profilePictureUrl,
    }));

  return { recruiters };
}
