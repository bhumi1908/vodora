"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { ReferenceCard } from "@/components/profile/reference/ReferenceCard";
import { ReferencesTabSkeleton } from "@/components/profile/reference/ReferencesTabSkeleton";
import {
  showReferenceInvitationResendErrorToast,
  showReferenceInvitationResentToast,
} from "@/lib/references/reference-toast";
import {
  isReferenceInvitationDeliveryFailed,
  isReferenceInvitationSending,
} from "@/lib/references/reference-invitation-delivery";
import {
  useRecruiterReferenceHistoryQuery,
  useResendReferenceInvitationMutation,
} from "@/lib/query/use-reference-queries";

type RecruiterReferenceHistoryTabProps = {
  onCollectReference?: () => void;
};

export function RecruiterReferenceHistoryTab({
  onCollectReference,
}: RecruiterReferenceHistoryTabProps) {
  const {
    data: references = [],
    isPending,
    isError,
    error,
  } = useRecruiterReferenceHistoryQuery();
  const resendInvitation = useResendReferenceInvitationMutation();
  const [resendingReferenceId, setResendingReferenceId] = useState<string | null>(
    null,
  );

  const verifiedCount = references.filter(
    (reference) => reference.status === "verified",
  ).length;
  const failedDeliveryCount = references.filter((reference) =>
    isReferenceInvitationDeliveryFailed(reference),
  ).length;

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load reference history."
    : "";

  async function handleResendInvitation(referenceId: string, refereeName: string) {
    setResendingReferenceId(referenceId);

    try {
      await resendInvitation.mutateAsync(referenceId);
      showReferenceInvitationResentToast(refereeName);
    } catch (resendError) {
      const message =
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend invitation email.";
      showReferenceInvitationResendErrorToast(message);
    } finally {
      setResendingReferenceId(null);
    }
  }

  if (isPending) {
    return <ReferencesTabSkeleton showAction={false} />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reference History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {verifiedCount} verified reference{verifiedCount === 1 ? "" : "s"}
            {references.length > verifiedCount
              ? ` · ${references.length} total`
              : ""}
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {failedDeliveryCount > 0 ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {failedDeliveryCount} reference invitation
          {failedDeliveryCount === 1 ? "" : "s"} could not be delivered. Use
          Resend invitation below to try again.
        </div>
      ) : null}

      {references.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-900">
            No reference requests yet
          </p>
          <p className="mt-2 text-sm text-gray-500">
            References you collect for candidates will appear here with their
            current status.
          </p>
          {onCollectReference ? (
            <button
              type="button"
              onClick={onCollectReference}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Collect a Reference
            </button>
          ) : (
            <Link
              href="/recruiter/profile?tab=collect"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Collect a Reference
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {references.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              candidateName={reference.candidateName}
              isOwnProfile={false}
              showRefereeContact
              showInvitationDelivery
              invitationSending={isReferenceInvitationSending(reference)}
              invitationDeliveryFailed={isReferenceInvitationDeliveryFailed(
                reference,
              )}
              onResendInvitation={() =>
                void handleResendInvitation(reference.id, reference.refereeName)
              }
              isResending={resendingReferenceId === reference.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
