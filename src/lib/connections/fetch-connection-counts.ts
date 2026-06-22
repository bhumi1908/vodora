import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionCounts } from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcCounts = {
  pending?: number;
  pending_received?: number;
  pending_sent?: number;
  connected?: number;
  total?: number;
};

const EMPTY_COUNTS: ConnectionCounts = {
  pending: 0,
  pendingReceived: 0,
  pendingSent: 0,
  connected: 0,
  total: 0,
};

function normalizeCounts(payload: RpcCounts | null): ConnectionCounts {
  if (!payload) {
    return EMPTY_COUNTS;
  }

  return {
    pending: payload.pending ?? 0,
    pendingReceived: payload.pending_received ?? 0,
    pendingSent: payload.pending_sent ?? 0,
    connected: payload.connected ?? 0,
    total: payload.total ?? 0,
  };
}

export async function fetchCandidateConnectionCounts(
  supabase: Supabase,
): Promise<ConnectionCounts> {
  const { data, error } = await supabase.rpc("get_candidate_connection_counts");

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return EMPTY_COUNTS;
  }

  return normalizeCounts(data as RpcCounts);
}

export async function fetchRecruiterConnectionCounts(
  supabase: Supabase,
): Promise<ConnectionCounts> {
  const { data, error } = await supabase.rpc("get_recruiter_connection_counts");

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return EMPTY_COUNTS;
  }

  return normalizeCounts(data as RpcCounts);
}
