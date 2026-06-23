import type { SupabaseClient } from "@supabase/supabase-js";

import type { ReferenceResponseFormData } from "@/components/profile/reference/types";
import { normalizeReferenceType } from "@/components/profile/reference/types";
import {
  getReferenceResponseFieldErrors,
  hasReferenceResponseFieldErrors,
  mapReferenceResponseToInsert,
} from "@/lib/profile/reference-validation";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type SubmitReferenceResponseResult =
  | {
      success: true;
      status: "verified" | "submitted";
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function submitReferenceResponse(
  supabase: Supabase,
  params: {
    referenceRequestId: string;
    userId: string;
    userEmail: string;
    invitedEmail: string;
    referenceType: string;
    input: ReferenceResponseFormData;
  },
): Promise<SubmitReferenceResponseResult> {
  if (params.userEmail.trim().toLowerCase() !== params.invitedEmail.trim().toLowerCase()) {
    return {
      success: false,
      error:
        "You must sign in with the email address that received this invitation.",
    };
  }

  const referenceType = normalizeReferenceType(params.referenceType);
  const fieldErrors = getReferenceResponseFieldErrors(params.input, referenceType);

  if (hasReferenceResponseFieldErrors(fieldErrors)) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors as Record<string, string>,
    };
  }

  const insertPayload = mapReferenceResponseToInsert(params.input, {
    referenceRequestId: params.referenceRequestId,
    userId: params.userId,
    referenceType,
  });

  const { error } = await supabase
    .from("reference_responses")
    .insert(insertPayload);

  if (error) {
    if (error.message.includes("not open for submission")) {
      return {
        success: false,
        error: "This reference request is no longer open for submission.",
      };
    }

    if (error.code === "23505") {
      return {
        success: false,
        error: "A response has already been submitted for this request.",
      };
    }

    console.error("submitReferenceResponse failed:", error);
    return {
      success: false,
      error: "Unable to submit reference. Please try again.",
    };
  }

  const { data: requestRow } = await supabase
    .from("reference_requests")
    .select("status")
    .eq("id", params.referenceRequestId)
    .maybeSingle();

  return {
    success: true,
    status: requestRow?.status === "verified" ? "verified" : "submitted",
  };
}
