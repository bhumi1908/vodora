import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type SendCandidatePeerConnectionResult = {
  id: string;
  status: ConnectionStatus;
  alreadyExists: boolean;
  error: string | null;
};

type RpcResponse = {
  id?: string;
  status?: string;
  already_exists?: boolean;
};

function normalizeStatus(value: string | undefined): ConnectionStatus {
  if (value === "connected") {
    return "connected";
  }

  return "pending";
}

export async function sendCandidatePeerConnectionRequest(
  supabase: Supabase,
  peerCandidateId: string,
  message?: string,
): Promise<SendCandidatePeerConnectionResult> {
  const trimmedMessage = message?.trim();

  const { data, error } = await supabase.rpc("send_candidate_peer_connection_request", {
    p_peer_candidate_id: peerCandidateId,
    p_message: trimmedMessage || undefined,
  });

  if (error) {
    return {
      id: "",
      status: "pending",
      alreadyExists: false,
      error: error.message,
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcResponse)
      : null;

  if (!payload?.id) {
    return {
      id: "",
      status: "pending",
      alreadyExists: false,
      error: "Could not send connection request.",
    };
  }

  return {
    id: payload.id,
    status: normalizeStatus(payload.status),
    alreadyExists: Boolean(payload.already_exists),
    error: null,
  };
}
