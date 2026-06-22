import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ConnectionListResult,
  ConnectionTab,
  RecruiterConnectionEntry,
} from "@/lib/connections/connection.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcRow = {
  id: string;
  status: string;
  connection_type?: string;
  initiated_by: string;
  message: string | null;
  requested_at: string;
  connected_at: string | null;
  candidate_id: string | null;
  peer_recruiter_id?: string | null;
  vodora_id: string | null;
  name: string;
  title: string;
  company: string | null;
  location: string;
  profile_picture_url: string | null;
};

type RpcResult = {
  total_count?: number;
  connections?: RpcRow[];
};

function normalizeConnectionType(
  value: string | undefined,
): RecruiterConnectionEntry["connectionType"] {
  if (value === "candidate_candidate") {
    return "candidate_candidate";
  }

  if (value === "recruiter_recruiter") {
    return "recruiter_recruiter";
  }

  return "candidate_recruiter";
}

function normalizeRow(row: RpcRow): RecruiterConnectionEntry {
  return {
    id: row.id,
    status: row.status === "connected" ? "connected" : "pending",
    connectionType: normalizeConnectionType(row.connection_type),
    initiatedBy: row.initiated_by === "recruiter" ? "recruiter" : "candidate",
    message: row.message,
    requestedAt: row.requested_at,
    connectedAt: row.connected_at,
    candidateId: row.candidate_id,
    peerRecruiterId: row.peer_recruiter_id ?? null,
    vodoraId: row.vodora_id,
    name: row.name,
    title: row.title,
    company: row.company,
    location: row.location,
    profilePictureUrl: row.profile_picture_url,
  };
}

export async function fetchRecruiterConnections(
  supabase: Supabase,
  tab: ConnectionTab,
  page: number,
  limit: number,
): Promise<ConnectionListResult<RecruiterConnectionEntry>> {
  const offset = Math.max(0, (page - 1) * limit);

  const { data, error } = await supabase.rpc("list_recruiter_connections", {
    p_tab: tab,
    p_offset: offset,
    p_limit: limit,
  });

  if (error) {
    return {
      connections: [],
      totalCount: 0,
      page,
      limit,
      totalPages: 0,
      error: error.message,
    };
  }

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as RpcResult)
      : null;

  const totalCount = payload?.total_count ?? 0;
  const connections = (payload?.connections ?? []).map(normalizeRow);

  return {
    connections,
    totalCount,
    page,
    limit,
    totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
    error: null,
  };
}
