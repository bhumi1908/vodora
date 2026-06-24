import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeReferenceSharePermissions } from "@/lib/references/reference-permissions";
import type { ReferenceShareType } from "@/lib/references/reference-grant-defaults";
import type { ReferenceRecruiterGrantItem } from "@/lib/references/reference-passport-share.types";
import { resolveIncludedReferenceIds } from "@/lib/references/resolve-included-reference-ids";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type GrantRow = {
  id: string;
  recruiter_id: string;
  share_type: string;
  included_reference_ids: string[] | null;
  permissions: unknown;
  grant_source: string;
  created_at: string;
  revoked_at: string | null;
};

type RecruiterMeta = {
  id: string;
  job_title: string | null;
  user_id: string;
  company_id: string | null;
};

async function loadRecruiterMeta(
  supabase: Supabase,
  recruiterIds: string[],
): Promise<Map<string, { name: string; company: string | null }>> {
  if (recruiterIds.length === 0) {
    return new Map();
  }

  const { data: recruiters } = await supabase
    .from("recruiters")
    .select("id, job_title, user_id, company_id")
    .in("id", recruiterIds);

  const recruiterRows = (recruiters ?? []) as RecruiterMeta[];
  const userIds = recruiterRows.map((row) => row.user_id);
  const companyIds = recruiterRows
    .map((row) => row.company_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: users }, { data: companies }] = await Promise.all([
    userIds.length > 0
      ? supabase
          .from("users")
          .select("id, first_name, last_name")
          .in("id", userIds)
      : Promise.resolve({ data: [] }),
    companyIds.length > 0
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [] }),
  ]);

  const userById = new Map(
    (users ?? []).map((user) => [
      user.id,
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim(),
    ]),
  );
  const companyById = new Map(
    (companies ?? []).map((company) => [company.id, company.name]),
  );

  return new Map(
    recruiterRows.map((row) => [
      row.id,
      {
        name: userById.get(row.user_id) || "Recruiter",
        company: row.company_id ? companyById.get(row.company_id) ?? null : null,
      },
    ]),
  );
}

function mapGrantRow(
  row: GrantRow,
  recruiterMeta: Map<string, { name: string; company: string | null }>,
): ReferenceRecruiterGrantItem {
  const meta = recruiterMeta.get(row.recruiter_id);

  return {
    id: row.id,
    recruiterId: row.recruiter_id,
    recruiterName: meta?.name ?? "Recruiter",
    recruiterCompany: meta?.company ?? null,
    shareType: row.share_type as ReferenceRecruiterGrantItem["shareType"],
    includedReferenceIds: row.included_reference_ids ?? [],
    permissions: normalizeReferenceSharePermissions(
      row.permissions as Partial<ReferenceRecruiterGrantItem["permissions"]>,
    ),
    grantSource: row.grant_source as ReferenceRecruiterGrantItem["grantSource"],
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  };
}

export async function fetchReferenceRecruiterGrants(
  supabase: Supabase,
  candidateId: string,
): Promise<{ grants: ReferenceRecruiterGrantItem[]; error?: string }> {
  const { data, error } = await supabase
    .from("reference_recruiter_grants")
    .select(
      "id, recruiter_id, share_type, included_reference_ids, permissions, grant_source, created_at, revoked_at",
    )
    .eq("candidate_id", candidateId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchReferenceRecruiterGrants failed:", error);
    return { grants: [], error: "Unable to load recruiter access." };
  }

  const rows = (data ?? []) as GrantRow[];
  const recruiterMeta = await loadRecruiterMeta(
    supabase,
    [...new Set(rows.map((row) => row.recruiter_id))],
  );

  return {
    grants: rows.map((row) => mapGrantRow(row, recruiterMeta)),
  };
}

export async function createManualReferenceRecruiterGrant(
  supabase: Supabase,
  candidateId: string,
  input: {
    recruiterId: string;
    shareType?: ReferenceShareType;
    includedReferenceIds?: string[];
    permissions?: Partial<ReferenceRecruiterGrantItem["permissions"]>;
  },
): Promise<{ grant: ReferenceRecruiterGrantItem | null; error?: string }> {
  const isSelectedShare = input.shareType === "selected_references";

  const resolved = await resolveIncludedReferenceIds(
    supabase,
    candidateId,
    true,
    isSelectedShare ? input.includedReferenceIds : [],
  );

  if (resolved.error) {
    return { grant: null, error: resolved.error };
  }

  const permissions = normalizeReferenceSharePermissions(input.permissions);

  const { data, error } = await supabase
    .from("reference_recruiter_grants")
    .insert({
      candidate_id: candidateId,
      recruiter_id: input.recruiterId,
      grant_source: "manual",
      job_application_id: null,
      share_type: resolved.shareType,
      included_reference_ids: resolved.includedReferenceIds,
      permissions,
    })
    .select(
      "id, recruiter_id, share_type, included_reference_ids, permissions, grant_source, created_at, revoked_at",
    )
    .single();

  if (error || !data) {
    console.error("createManualReferenceRecruiterGrant failed:", error);
    return {
      grant: null,
      error: "Unable to share references with this recruiter.",
    };
  }

  const recruiterMeta = await loadRecruiterMeta(supabase, [input.recruiterId]);

  return {
    grant: mapGrantRow(data as GrantRow, recruiterMeta),
  };
}

export async function revokeReferenceRecruiterGrant(
  supabase: Supabase,
  candidateId: string,
  grantId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("reference_recruiter_grants")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", grantId)
    .eq("candidate_id", candidateId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("revokeReferenceRecruiterGrant failed:", error);
    return { success: false, error: "Unable to revoke recruiter access." };
  }

  if (!data) {
    return {
      success: false,
      error: "Recruiter access not found or already revoked.",
    };
  }

  return { success: true };
}
