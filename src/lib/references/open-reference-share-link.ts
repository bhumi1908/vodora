import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_REFERENCE_GRANT_PERMISSIONS } from "@/lib/references/reference-grant-defaults";
import {
  mapReferenceRpcRows,
  parseReferenceRpcRows,
} from "@/lib/references/map-reference-rpc-rows";
import type { OpenReferenceShareLinkResult } from "@/lib/references/reference-passport-share.types";
import {
  normalizeReferenceSharePermissions,
  type ReferenceSharePermissions,
} from "@/lib/references/reference-permissions";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type OpenShareRpcPayload = {
  error?: string;
  share_id?: string;
  share_type?: string;
  view_count?: number;
  permissions?: Partial<ReferenceSharePermissions>;
  candidate?: {
    id: string;
    vodora_id: string | null;
    name: string;
    title: string | null;
    city: string | null;
    country: string | null;
    profile_picture_url: string | null;
  };
  references?: unknown;
};

const SHARE_ERROR_MESSAGES: Record<string, string> = {
  authentication_required: "Sign in to view this Reference Passport.",
  recruiter_required: "Recruiter account required to view shared references.",
  not_found: "This share link is invalid or no longer available.",
  inactive: "This share link has been revoked.",
  expired: "This share link has expired.",
};

export async function openReferenceShareLink(
  supabase: Supabase,
  shareToken: string,
): Promise<{ result: OpenReferenceShareLinkResult | null; error?: string }> {
  const { data, error } = await supabase.rpc("open_reference_share_link", {
    p_share_token: shareToken,
  });

  if (error) {
    console.error("openReferenceShareLink failed:", error);
    return { result: null, error: "Unable to open share link." };
  }

  const payload = (data ?? {}) as OpenShareRpcPayload;

  if (payload.error) {
    return {
      result: null,
      error: SHARE_ERROR_MESSAGES[payload.error] ?? "Unable to open share link.",
    };
  }

  if (!payload.candidate || !payload.share_id || !payload.share_type) {
    return { result: null, error: "Unable to open share link." };
  }

  return {
    result: {
      shareId: payload.share_id,
      shareType: payload.share_type as OpenReferenceShareLinkResult["shareType"],
      viewCount: payload.view_count ?? 0,
      permissions: normalizeReferenceSharePermissions(
        payload.permissions ?? DEFAULT_REFERENCE_GRANT_PERMISSIONS,
      ),
      candidate: {
        id: payload.candidate.id,
        vodoraId: payload.candidate.vodora_id,
        name: payload.candidate.name,
        title: payload.candidate.title,
        city: payload.candidate.city,
        country: payload.candidate.country,
        profilePictureUrl: payload.candidate.profile_picture_url,
      },
      references: mapReferenceRpcRows(parseReferenceRpcRows(payload.references)),
    },
  };
}
