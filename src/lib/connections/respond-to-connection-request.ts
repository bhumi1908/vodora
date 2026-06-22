import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConnectionStatus } from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type ConnectionResponseAction = "accept" | "reject";

export type RespondToConnectionResult = {
  id: string;
  status: ConnectionStatus | "rejected";
  action: ConnectionResponseAction;
  error: string | null;
};

type RpcResponse = {
  id?: string;
  status?: string;
  action?: string;
};

export async function respondToConnectionRequest(
  supabase: Supabase,
  connectionId: string,
  action: ConnectionResponseAction,
): Promise<RespondToConnectionResult> {
  const { data, error } = await supabase.rpc("respond_to_connection_request", {
    p_connection_id: connectionId,
    p_action: action,
  });

  if (error) {
    return {
      id: connectionId,
      status: "pending",
      action,
      error: error.message,
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcResponse)
      : null;

  if (!payload?.id) {
    return {
      id: connectionId,
      status: "pending",
      action,
      error: "Could not update connection request.",
    };
  }

  const status =
    payload.status === "connected"
      ? "connected"
      : payload.status === "rejected"
        ? "rejected"
        : "pending";

  return {
    id: payload.id,
    status,
    action: payload.action === "reject" ? "reject" : "accept",
    error: null,
  };
}
