import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcResponse = {
  id?: string;
  status?: string;
  initiated_by?: string;
  connection_type?: string;
  viewer_is_initiator?: boolean;
};

export async function fetchCandidateRecruiterConnectionStatus(
  supabase: Supabase,
  recruiterId: string,
): Promise<ProfileConnectionState> {
  const { data, error } = await supabase.rpc(
    "get_candidate_recruiter_connection_status",
    { p_recruiter_id: recruiterId },
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
    initiatedBy: payload.viewer_is_initiator ? "candidate" : "recruiter",
    connectionType: "candidate_recruiter",
  };
}
