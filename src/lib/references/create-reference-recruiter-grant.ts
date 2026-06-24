import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_REFERENCE_GRANT_PERMISSIONS } from "@/lib/references/reference-grant-defaults";
import type { ReferenceShareType } from "@/lib/references/reference-grant-defaults";
import type { ReferenceRecruiterGrantItem } from "@/lib/references/reference-passport-share.types";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export async function createReferenceRecruiterGrant(
  supabase: Supabase,
  input: {
    candidateId: string;
    recruiterId: string;
    jobApplicationId: string;
    shareType: ReferenceShareType;
    includedReferenceIds: string[];
    permissions?: ReferenceRecruiterGrantItem["permissions"];
  },
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("reference_recruiter_grants").insert({
    candidate_id: input.candidateId,
    recruiter_id: input.recruiterId,
    grant_source: "job_application",
    job_application_id: input.jobApplicationId,
    share_type: input.shareType,
    included_reference_ids: input.includedReferenceIds,
    permissions: input.permissions ?? DEFAULT_REFERENCE_GRANT_PERMISSIONS,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }

    console.error("createReferenceRecruiterGrant failed:", error);
    return {
      success: false,
      error: "Application submitted, but references could not be shared.",
    };
  }

  return { success: true };
}
