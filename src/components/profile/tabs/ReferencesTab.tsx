"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ReferenceCard } from "@/components/profile/reference/ReferenceCard";
import { ReferencesTabSkeleton } from "@/components/profile/reference/ReferencesTabSkeleton";
import { RequestReferenceModal } from "@/components/profile/reference/RequestReferenceModal";
import type { CandidateProfileData } from "@/lib/profile/types";
import {
  showReferenceCancelledToast,
  showReferenceRequestErrorToast,
} from "@/lib/references/reference-toast";
import {
  useCancelReferenceMutation,
  useCandidateReferencesQuery,
  useInvalidateCandidateReferences,
  useRecruiterCandidateReferencesQuery,
} from "@/lib/query/use-reference-queries";

type ReferencesTabProps = {
  isOwnProfile: boolean;
  profile?: CandidateProfileData;
  hasReferenceAccess?: boolean;
  onReferencesChange?: () => void;
};

function buildEmploymentHistoryOptions(profile?: CandidateProfileData) {
  if (!profile?.experience?.length) {
    return [];
  }

  return profile.experience.map((entry) => ({
    id: entry.id,
    label: `${entry.title} at ${entry.company}`,
  }));
}

export function ReferencesTab({
  isOwnProfile,
  profile,
  hasReferenceAccess = false,
  onReferencesChange,
}: ReferencesTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const {
    data: ownReferences = [],
    isPending: isOwnPending,
    isError: isOwnError,
    error: ownError,
  } = useCandidateReferencesQuery(isOwnProfile);

  const {
    data: recruiterReferences = [],
    isPending: isRecruiterPending,
    isError: isRecruiterError,
    error: recruiterError,
  } = useRecruiterCandidateReferencesQuery(
    profile?.vodoraId ?? null,
    !isOwnProfile && hasReferenceAccess,
  );

  const cancelReference = useCancelReferenceMutation();
  const invalidateReferences = useInvalidateCandidateReferences();

  const references = isOwnProfile ? ownReferences : recruiterReferences;
  const isPending = isOwnProfile ? isOwnPending : isRecruiterPending;
  const isError = isOwnProfile ? isOwnError : isRecruiterError;
  const error = isOwnProfile ? ownError : recruiterError;

  const employmentHistoryOptions = useMemo(
    () => buildEmploymentHistoryOptions(profile),
    [profile],
  );

  const verifiedCount = references.filter(
    (reference) => reference.status === "verified",
  ).length;

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Unable to load references."
    : "";

  async function handleCancel(referenceId: string) {
    setCancellingId(referenceId);

    try {
      await cancelReference.mutateAsync(referenceId);
      showReferenceCancelledToast();
      onReferencesChange?.();
    } catch (cancelError) {
      const message =
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel reference request.";
      showReferenceRequestErrorToast(message);
    } finally {
      setCancellingId(null);
    }
  }

  function handleSubmitted() {
    invalidateReferences();
    onReferencesChange?.();
  }

  if (!isOwnProfile && !hasReferenceAccess) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        References are only visible when shared by the candidate.
      </div>
    );
  }

  if (isPending) {
    return (
      <div>
        <ReferencesTabSkeleton />
        {isOwnProfile ? (
          <RequestReferenceModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmitted={handleSubmitted}
            employmentHistoryOptions={employmentHistoryOptions}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Professional References
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {verifiedCount} verified reference{verifiedCount === 1 ? "" : "s"}
            {isOwnProfile && references.length > verifiedCount
              ? ` · ${references.length} total`
              : ""}
          </p>
        </div>

        {isOwnProfile ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Request Reference
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {references.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-900">
            {isOwnProfile ? "No references yet" : "No shared references"}
          </p>
          {isOwnProfile ? (
            <>
              <p className="mt-2 text-sm text-gray-500">
                Request your first reference to start building your Reference
                Passport.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Request Reference
              </button>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              The candidate has not shared any verified references with you yet.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {references.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              isOwnProfile={isOwnProfile}
              showRefereeContact={isOwnProfile}
              onCancel={isOwnProfile ? handleCancel : undefined}
              isCancelling={cancellingId === reference.id}
            />
          ))}
        </div>
      )}

      {isOwnProfile ? (
        <RequestReferenceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmitted={handleSubmitted}
          employmentHistoryOptions={employmentHistoryOptions}
        />
      ) : null}
    </div>
  );
}
