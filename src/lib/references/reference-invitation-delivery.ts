const INVITATION_SENDING_GRACE_MS = 90_000;

type InvitationDeliveryFields = {
  status: string;
  invitationSentAt?: string | null;
  createdAt: string;
};

export function isReferenceInvitationSending(
  reference: InvitationDeliveryFields,
): boolean {
  if (reference.status !== "pending" || reference.invitationSentAt) {
    return false;
  }

  const ageMs = Date.now() - new Date(reference.createdAt).getTime();
  return ageMs < INVITATION_SENDING_GRACE_MS;
}

export function isReferenceInvitationDeliveryFailed(
  reference: InvitationDeliveryFields,
): boolean {
  return (
    reference.status === "pending" &&
    !reference.invitationSentAt &&
    !isReferenceInvitationSending(reference)
  );
}
