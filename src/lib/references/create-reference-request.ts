import type { SupabaseClient } from "@supabase/supabase-js";

import type { RequestReferenceFormData } from "@/components/profile/reference/types";
import { getRelationshipLabel } from "@/components/profile/reference/types";
import { sendEmail } from "@/lib/email/smtp";
import {
  buildReferenceRequestHtml,
  buildReferenceRequestText,
} from "@/lib/email/templates/reference-request";
import {
  mapReferenceRequestToInsert,
  validateReferenceRequest,
} from "@/lib/profile/reference-validation";
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

type ReferenceRequestEmailParams = {
  referenceRequestId: string;
  inviteUrl: string;
  candidateName: string;
  refereeName: string;
  refereeEmail: string;
  refereeCompany: string;
  relationshipLabel: string;
  message?: string | null;
};

async function sendReferenceRequestEmail(
  params: ReferenceRequestEmailParams,
): Promise<void> {
  const emailResult = await sendEmail({
    to: params.refereeEmail,
    subject: `Reference request from ${params.candidateName} on Vodora`,
    html: buildReferenceRequestHtml({
      inviteUrl: params.inviteUrl,
      candidateName: params.candidateName,
      refereeName: params.refereeName,
      refereeCompany: params.refereeCompany,
      relationshipLabel: params.relationshipLabel,
      message: params.message,
    }),
    text: buildReferenceRequestText({
      inviteUrl: params.inviteUrl,
      candidateName: params.candidateName,
      refereeName: params.refereeName,
      refereeCompany: params.refereeCompany,
      relationshipLabel: params.relationshipLabel,
      message: params.message,
    }),
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reference_requests")
    .update({ invitation_sent_at: new Date().toISOString() })
    .eq("id", params.referenceRequestId);

  if (error) {
    console.error("Failed to update invitation_sent_at:", error);
  }
}

export function queueReferenceRequestEmail(
  params: ReferenceRequestEmailParams,
): void {
  void sendReferenceRequestEmail(params).catch((error) => {
    console.error("Background reference request email failed:", error);
  });
}

export async function createReferenceRequest(
  supabase: Supabase,
  context: { candidateId: string; userId: string; candidateName: string },
  input: RequestReferenceFormData,
  origin: string,
): Promise<CreateReferenceRequestResult> {
  const validationError = validateReferenceRequest(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const insertPayload = mapReferenceRequestToInsert(input, context);

  const { data, error } = await supabase
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

  queueReferenceRequestEmail({
    referenceRequestId: data.id,
    inviteUrl,
    candidateName: context.candidateName,
    refereeName: data.referee_name,
    refereeEmail: data.referee_email,
    refereeCompany: input.company.trim(),
    relationshipLabel: getRelationshipLabel(input.relationship),
    message: input.message,
  });

  return {
    success: true,
    id: data.id,
  };
}
