import type { SupabaseClient } from "@supabase/supabase-js";

import { buildReferenceShareUrl } from "@/lib/references/build-reference-share-url";
import {
  normalizeReferenceSharePermissions,
  resolveShareExpiresAt,
} from "@/lib/references/reference-permissions";
import type { ReferencePassportShareItem } from "@/lib/references/reference-passport-share.types";
import { resolveIncludedReferenceIds } from "@/lib/references/resolve-included-reference-ids";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

function mapShareRow(
  row: {
    id: string;
    share_token: string;
    share_type: string;
    included_reference_ids: string[] | null;
    permissions: unknown;
    is_active: boolean;
    expires_at: string | null;
    view_count: number;
    created_at: string;
  },
  origin?: string,
): ReferencePassportShareItem {
  return {
    id: row.id,
    shareToken: row.share_token,
    shareType: row.share_type as ReferencePassportShareItem["shareType"],
    includedReferenceIds: row.included_reference_ids ?? [],
    permissions: normalizeReferenceSharePermissions(
      row.permissions as Partial<ReferencePassportShareItem["permissions"]>,
    ),
    isActive: row.is_active,
    expiresAt: row.expires_at,
    viewCount: row.view_count,
    createdAt: row.created_at,
    shareUrl: buildReferenceShareUrl(row.share_token, origin),
  };
}

export async function fetchReferencePassportShares(
  supabase: Supabase,
  candidateId: string,
  origin?: string,
): Promise<{ shares: ReferencePassportShareItem[]; error?: string }> {
  const { data, error } = await supabase
    .from("reference_passport_shares")
    .select(
      "id, share_token, share_type, included_reference_ids, permissions, is_active, expires_at, view_count, created_at",
    )
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchReferencePassportShares failed:", error);
    return { shares: [], error: "Unable to load share links." };
  }

  return {
    shares: (data ?? []).map((row) => mapShareRow(row, origin)),
  };
}

export async function createReferencePassportShare(
  supabase: Supabase,
  candidateId: string,
  input: {
    shareType?: "full_passport" | "selected_references";
    includedReferenceIds?: string[];
    permissions?: Partial<ReferencePassportShareItem["permissions"]>;
    expiresInDays?: number | null;
  },
  origin?: string,
): Promise<{
  share: ReferencePassportShareItem | null;
  error?: string;
}> {
  const isSelectedShare = input.shareType === "selected_references";

  const resolved = await resolveIncludedReferenceIds(
    supabase,
    candidateId,
    true,
    isSelectedShare ? input.includedReferenceIds : [],
  );

  if (resolved.error) {
    return { share: null, error: resolved.error };
  }

  const permissions = normalizeReferenceSharePermissions(input.permissions);
  const expiresAt = resolveShareExpiresAt(input.expiresInDays);

  const { data, error } = await supabase
    .from("reference_passport_shares")
    .insert({
      candidate_id: candidateId,
      share_type: resolved.shareType,
      included_reference_ids: resolved.includedReferenceIds,
      permissions,
      expires_at: expiresAt,
      is_active: true,
    })
    .select(
      "id, share_token, share_type, included_reference_ids, permissions, is_active, expires_at, view_count, created_at",
    )
    .single();

  if (error || !data) {
    console.error("createReferencePassportShare failed:", error);
    return { share: null, error: "Unable to create share link." };
  }

  return {
    share: mapShareRow(data, origin),
  };
}

export async function revokeReferencePassportShare(
  supabase: Supabase,
  candidateId: string,
  shareId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("reference_passport_shares")
    .update({ is_active: false })
    .eq("id", shareId)
    .eq("candidate_id", candidateId)
    .eq("is_active", true)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("revokeReferencePassportShare failed:", error);
    return { success: false, error: "Unable to revoke share link." };
  }

  if (!data) {
    return { success: false, error: "Share link not found or already revoked." };
  }

  return { success: true };
}
