import { deliverReferenceInvitation } from "@/lib/references/deliver-reference-invitation";
import { fetchReferenceRequestDeliveryContext } from "@/lib/references/fetch-reference-request-delivery-context";

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export type ResendReferenceInvitationResult =
  | { success: true }
  | { success: false; error: string; status: number };

export async function resendReferenceInvitationEmail(
  referenceRequestId: string,
  origin: string,
  recruiterEmail?: string | null,
): Promise<ResendReferenceInvitationResult> {
  const deliveryContext = await fetchReferenceRequestDeliveryContext(
    referenceRequestId,
    origin,
    recruiterEmail,
  );

  if (!deliveryContext.success) {
    return {
      success: false,
      error: deliveryContext.error,
      status: 400,
    };
  }

  if (deliveryContext.invitationSentAt) {
    const sentAtMs = new Date(deliveryContext.invitationSentAt).getTime();

    if (Date.now() - sentAtMs < RESEND_COOLDOWN_MS) {
      return {
        success: false,
        error:
          "An invitation was sent recently. Please wait a few minutes before resending.",
        status: 429,
      };
    }
  }

  const result = await deliverReferenceInvitation(deliveryContext.params);

  if (!result.success) {
    return {
      success: false,
      error:
        "We could not deliver the invitation email. Please try again shortly.",
      status: 502,
    };
  }

  return { success: true };
}
