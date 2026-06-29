import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";

import type { ReferenceResponseFormData } from "@/components/profile/reference/types";
import { normalizeReferenceType } from "@/components/profile/reference/types";
import { CANDIDATE_WELCOME_PATH } from "@/lib/auth/routes";
import {
  getReferenceResponseFieldErrors,
  hasReferenceResponseFieldErrors,
  mapReferenceResponseToInsert,
} from "@/lib/profile/reference-validation";
import { provisionInvitedReferee } from "@/lib/references/provision-invited-referee";
import { sendInvitedCandidateSetupLinkEmail } from "@/lib/references/queue-reference-collection-candidate-email";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type SubmitReferenceResponseResult =
  | {
      success: true;
      status: "verified" | "submitted" | "rejected";
      responseId: string;
      welcomeRedirectTo?: string;
      profileSetupRequested?: boolean;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

type SubmitReferenceResponseParams = {
  referenceRequestId: string;
  invitedEmail: string;
  refereeName: string;
  refereeTitle: string;
  refereeCompany: string;
  referenceType: string;
  input: ReferenceResponseFormData;
  origin?: string;
  auth?: {
    supabase: Supabase;
    userId: string;
    userEmail: string;
  };
};

function emailsMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

async function resolveSubmittedByUserId(
  params: SubmitReferenceResponseParams,
): Promise<
  | { success: true; userId: string | null }
  | { success: false; error: string }
> {
  const useAuthenticatedSubmit =
    params.auth &&
    emailsMatch(params.auth.userEmail, params.invitedEmail);

  if (useAuthenticatedSubmit) {
    return { success: true, userId: params.auth!.userId };
  }

  if (!params.input.allowProfileCreation) {
    return { success: true, userId: null };
  }

  const provisionResult = await provisionInvitedReferee({
    email: params.invitedEmail,
    name: params.refereeName,
    title: params.refereeTitle,
    company: params.refereeCompany,
  });

  if (!provisionResult.success) {
    return { success: false, error: provisionResult.error };
  }

  return {
    success: true,
    userId: provisionResult.userId,
  };
}

function queueRefereeProfileSetupEmail(
  params: SubmitReferenceResponseParams,
): void {
  if (!params.origin?.trim()) {
    return;
  }

  const firstName = params.refereeName.trim().split(/\s+/)[0] ?? "there";

  after(async () => {
    const emailResult = await sendInvitedCandidateSetupLinkEmail(
      params.invitedEmail,
      params.origin!,
      firstName,
    );

    if (!emailResult.success) {
      console.error(
        "Background referee profile setup email failed:",
        emailResult.error,
      );
    }
  });
}

export async function submitReferenceResponse(
  params: SubmitReferenceResponseParams,
): Promise<SubmitReferenceResponseResult> {
  const referenceType = normalizeReferenceType(params.referenceType);
  const fieldErrors = getReferenceResponseFieldErrors(params.input, referenceType);

  if (hasReferenceResponseFieldErrors(fieldErrors)) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors as Record<string, string>,
    };
  }

  const userResolution = await resolveSubmittedByUserId(params);

  if (!userResolution.success) {
    return { success: false, error: userResolution.error };
  }

  const insertPayload = mapReferenceResponseToInsert(params.input, {
    referenceRequestId: params.referenceRequestId,
    userId: userResolution.userId,
    referenceType,
  });

  const useAuthenticatedSubmit =
    params.auth &&
    emailsMatch(params.auth.userEmail, params.invitedEmail);

  const insertClient = useAuthenticatedSubmit
    ? params.auth!.supabase
    : createAdminClient();

  const { data: inserted, error } = await insertClient
    .from("reference_responses")
    .insert(insertPayload)
    .select("id")
    .single();

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

  if (params.input.refereePhone.trim()) {
    await insertClient
      .from("reference_requests")
      .update({ referee_phone: params.input.refereePhone.trim() })
      .eq("id", params.referenceRequestId);
  }

  const { data: requestRow } = await insertClient
    .from("reference_requests")
    .select("status")
    .eq("id", params.referenceRequestId)
    .maybeSingle();

  const result: SubmitReferenceResponseResult = {
    success: true,
    status:
      requestRow?.status === "verified"
        ? "verified"
        : requestRow?.status === "rejected"
          ? "rejected"
          : "submitted",
    responseId: inserted.id,
  };

  if (params.input.allowProfileCreation) {
    if (useAuthenticatedSubmit) {
      return { ...result, welcomeRedirectTo: CANDIDATE_WELCOME_PATH };
    }

    queueRefereeProfileSetupEmail(params);
    return { ...result, profileSetupRequested: true };
  }

  return result;
}
