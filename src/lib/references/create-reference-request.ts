import type { SupabaseClient } from "@supabase/supabase-js";

import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { getRelationshipLabel } from "@/components/profile/reference/types";
import {
  mapReferenceRequestToInsert,
  type ReferenceRequestInsertContext,
  validateReferenceRequest,
} from "@/lib/profile/reference-validation";
import { queueReferenceRequestDelivery } from "@/lib/references/queue-reference-request-delivery";
import type { DeliverReferenceInvitationParams } from "@/lib/references/reference-request-email.types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

export type CreateReferenceRequestResult =
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

type QueueReferenceRequestDeliveryOptions = {
  recruiterEmail?: string | null;
  historyUrl?: string | null;
};

export async function createReferenceRequest(
  supabase: Supabase,
  context: ReferenceRequestInsertContext & { candidateName: string },
  input: RequestReferenceFormData,
  origin: string,
  deliveryOptions: QueueReferenceRequestDeliveryOptions = {},
): Promise<CreateReferenceRequestResult> {
  const validationError = validateReferenceRequest(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const insertPayload = mapReferenceRequestToInsert(input, context);
  const insertClient = context.recruiterId ? createAdminClient() : supabase;

  const { data, error } = await insertClient
    .from("reference_requests")
    .insert(insertPayload)
    .select("id, invitation_token, referee_email, referee_name")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error:
          "A reference request is already pending for this referee email.",
      };
    }

    console.error("createReferenceRequest insert failed:", error);
    return {
      success: false,
      error: "Unable to create reference request. Please try again.",
    };
  }

  const inviteUrl = `${origin}/reference/respond?token=${data.invitation_token}`;

  const deliveryParams: DeliverReferenceInvitationParams = {
    referenceRequestId: data.id,
    inviteUrl,
    candidateName: context.candidateName,
    refereeName: data.referee_name,
    refereeEmail: data.referee_email,
    refereeCompany: input.company.trim(),
    relationshipLabel: getRelationshipLabel(input.relationship),
    message: input.message,
    recruiterName: context.recruiterName,
    recruiterCompany: context.recruiterCompany,
    recruiterEmail: deliveryOptions.recruiterEmail,
    historyUrl: deliveryOptions.historyUrl,
  };

  queueReferenceRequestDelivery(deliveryParams);

  return {
    success: true,
    id: data.id,
  };
}
