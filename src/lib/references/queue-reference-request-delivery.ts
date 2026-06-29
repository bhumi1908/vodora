import { after } from "next/server";

import { deliverReferenceInvitation } from "@/lib/references/deliver-reference-invitation";
import type { DeliverReferenceInvitationParams } from "@/lib/references/reference-request-email.types";

export function queueReferenceRequestDelivery(
  params: DeliverReferenceInvitationParams,
): void {
  after(async () => {
    try {
      await deliverReferenceInvitation(params);
    } catch (error) {
      console.error("Background reference invitation delivery failed:", error);
    }
  });
}
