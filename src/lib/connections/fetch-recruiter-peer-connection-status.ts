import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcResponse = {
  id?: string;
  status?: string;
};

export async function fetchRecruiterPeerConnectionStatus(
  supabase: Supabase,
  peerRecruiterId: string,
): Promise<ConnectionStatus | null> {
  const { data, error } = await supabase.rpc("get_recruiter_peer_connection_status", {
    p_peer_recruiter_id: peerRecruiterId,
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const payload = data as RpcResponse;

  if (payload.status === "connected" || payload.status === "pending") {
    return payload.status;
  }

  return null;
}
