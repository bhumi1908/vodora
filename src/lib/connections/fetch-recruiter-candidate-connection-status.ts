import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcResponse = {
  id?: string;
  status?: string;
  initiated_by?: string;
  connection_type?: string;
};

export async function fetchRecruiterCandidateConnectionStatus(
  supabase: Supabase,
  candidateId: string,
): Promise<ProfileConnectionState> {
  const { data, error } = await supabase.rpc(
    "get_recruiter_candidate_connection_status",
    { p_candidate_id: candidateId },
  );

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const payload = data as RpcResponse;

  if (!payload.id || !payload.status) {
    return null;
  }

  return {
    id: payload.id,
    status: payload.status === "connected" ? "connected" : "pending",
    initiatedBy:
      payload.initiated_by === "recruiter" ? "recruiter" : "candidate",
    connectionType:
      payload.connection_type === "candidate_candidate"
        ? "candidate_candidate"
        : payload.connection_type === "recruiter_recruiter"
          ? "recruiter_recruiter"
          : "candidate_recruiter",
  };
}
