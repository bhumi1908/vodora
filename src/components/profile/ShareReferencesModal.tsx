"use client";

import {
  Copy,
  Link2,
  Loader2,
  Mail,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  SELECT_RIGHT_PADDING_CLASSNAME,
  SelectField,
} from "@/components/shared/SelectField";
import { ReferenceSharePermissionsFields } from "@/components/profile/reference/ReferenceSharePermissionsFields";
import {
  buildSharingPayload,
  ReferenceShareSelectionFields,
} from "@/components/profile/reference/ReferenceShareSelectionFields";
import {
  normalizeReferenceSharePermissions,
  REFERENCE_EXPIRY_OPTIONS,
  type ReferenceSharePermissions,
} from "@/lib/references/reference-permissions";
import {
  showRecruiterAccessRevokedToast,
  showRecruiterAccessSharedToast,
  showShareLinkCopiedToast,
  showShareLinkCreatedToast,
  showShareLinkEmailedToast,
  showShareLinkErrorToast,
  showShareLinkRevokedToast,
} from "@/lib/references/reference-share-toast";
import {
  useCandidateReferencesQuery,
  useCreateReferenceRecruiterGrantMutation,
  useCreateReferenceShareMutation,
  useReferencePassportSharesQuery,
  useReferenceShareGrantsQuery,
  useRevokeReferenceRecruiterGrantMutation,
  useRevokeReferenceShareMutation,
  useSendReferenceShareLinkToRecruiterMutation,
} from "@/lib/query/use-reference-queries";

type ShareReferencesModalProps = {
  open: boolean;
  onClose: () => void;
};

type ShareMode = "link" | "recruiter";

function formatShareLabel(shareType: string, includedCount: number): string {
  if (shareType === "full_passport" || includedCount === 0) {
    return "Full Reference Passport";
  }

  return `${includedCount} selected reference${includedCount === 1 ? "" : "s"}`;
}

function formatGrantSource(source: string): string {
  if (source === "job_application") {
    return "Via job application";
  }

  if (source === "manual") {
    return "Shared directly";
  }

  return "Shared via connection";
}

function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) {
    return null;
  }

  const expires = new Date(expiresAt);

  if (Number.isNaN(expires.getTime())) {
    return null;
  }

  return `Expires ${expires.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function ShareReferencesModal({
  open,
  onClose,
}: ShareReferencesModalProps) {
  const [mode, setMode] = useState<ShareMode>("link");
  const [shareAllReferences, setShareAllReferences] = useState(true);
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<ReferenceSharePermissions>(
    normalizeReferenceSharePermissions(),
  );
  const [expiresInDays, setExpiresInDays] = useState(0);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState("");
  const [revokingShareId, setRevokingShareId] = useState<string | null>(null);
  const [revokingGrantId, setRevokingGrantId] = useState<string | null>(null);

  const { data: references = [] } = useCandidateReferencesQuery(open);
  const { data: shares = [], isPending: sharesPending } =
    useReferencePassportSharesQuery(open);
  const { data: grantData, isPending: grantsPending } =
    useReferenceShareGrantsQuery(open);
  const createShare = useCreateReferenceShareMutation();
  const revokeShare = useRevokeReferenceShareMutation();
  const createGrant = useCreateReferenceRecruiterGrantMutation();
  const revokeGrant = useRevokeReferenceRecruiterGrantMutation();
  const sendShareLinkEmail = useSendReferenceShareLinkToRecruiterMutation();

  const verifiedReferences = useMemo(
    () => references.filter((reference) => reference.status === "verified"),
    [references],
  );

  const activeShares = useMemo(
    () => shares.filter((share) => share.isActive),
    [shares],
  );

  const grants = grantData?.grants ?? [];
  const connectedRecruiters = grantData?.connectedRecruiters ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode("link");
    setShareAllReferences(true);
    setSelectedReferenceIds(verifiedReferences.map((reference) => reference.id));
    setPermissions(normalizeReferenceSharePermissions());
    setExpiresInDays(0);
    setSelectedRecruiterId("");
  }, [open, verifiedReferences]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      showShareLinkCopiedToast();
    } catch {
      showShareLinkErrorToast("Could not copy link to clipboard.");
    }
  }

  function getSharingPayload() {
    return buildSharingPayload(
      shareAllReferences,
      selectedReferenceIds,
      verifiedReferences.length,
    );
  }

  async function handleCreateShare() {
    if (verifiedReferences.length === 0) {
      showShareLinkErrorToast("Add at least one verified reference first.");
      return;
    }

    const sharing = getSharingPayload();

    try {
      const share = await createShare.mutateAsync({
        ...sharing,
        permissions,
        expiresInDays,
      });
      showShareLinkCreatedToast();
      await handleCopy(share.shareUrl);
    } catch (error) {
      showShareLinkErrorToast(
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async function handleShareWithRecruiter() {
    if (!selectedRecruiterId) {
      showShareLinkErrorToast("Select a connected recruiter.");
      return;
    }

    const sharing = getSharingPayload();
    const recruiter = connectedRecruiters.find(
      (entry) => entry.recruiterId === selectedRecruiterId,
    );

    try {
      await createGrant.mutateAsync({
        recruiterId: selectedRecruiterId,
        ...sharing,
        permissions,
      });
      showRecruiterAccessSharedToast(recruiter?.name);
    } catch (error) {
      showShareLinkErrorToast(
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async function handleEmailShareLinkToRecruiter() {
    if (!selectedRecruiterId) {
      showShareLinkErrorToast("Select a connected recruiter.");
      return;
    }

    const sharing = getSharingPayload();
    const recruiter = connectedRecruiters.find(
      (entry) => entry.recruiterId === selectedRecruiterId,
    );

    try {
      await sendShareLinkEmail.mutateAsync({
        recruiterId: selectedRecruiterId,
        ...sharing,
        permissions,
        expiresInDays,
      });
      showShareLinkEmailedToast(recruiter?.name);
    } catch (error) {
      showShareLinkErrorToast(
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async function handleRevokeShare(shareId: string) {
    setRevokingShareId(shareId);

    try {
      await revokeShare.mutateAsync(shareId);
      showShareLinkRevokedToast();
    } catch (error) {
      showShareLinkErrorToast(
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setRevokingShareId(null);
    }
  }

  async function handleRevokeGrant(grantId: string) {
    setRevokingGrantId(grantId);

    try {
      await revokeGrant.mutateAsync(grantId);
      showRecruiterAccessRevokedToast();
    } catch (error) {
      showShareLinkErrorToast(
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setRevokingGrantId(null);
    }
  }

  if (!open) {
    return null;
  }

  const hasVerifiedReferences = verifiedReferences.length > 0;
  const hasValidSelection =
    shareAllReferences || selectedReferenceIds.length > 0;
  const canCreateLink =
    hasVerifiedReferences && hasValidSelection && !createShare.isPending;
  const canShareWithRecruiter =
    hasVerifiedReferences &&
    hasValidSelection &&
    Boolean(selectedRecruiterId) &&
    !createGrant.isPending &&
    !sendShareLinkEmail.isPending;
  const canEmailShareLinkToRecruiter =
    hasVerifiedReferences &&
    hasValidSelection &&
    Boolean(selectedRecruiterId) &&
    !sendShareLinkEmail.isPending &&
    !createGrant.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close share references modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-references-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2
              id="share-references-title"
              className="text-lg font-semibold text-gray-900"
            >
              Share References
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Control what recruiters can see and how they get access.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 px-6">
          <div className="flex flex-col gap-2 py-3 sm:flex-row">
            {[
              { id: "link" as const, label: "Secure link", icon: Link2 },
              { id: "recruiter" as const, label: "Connected recruiter", icon: UserRound },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:w-auto ${
                  mode === id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-5">
          {!hasVerifiedReferences ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
              You need at least one verified reference before sharing.
            </div>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  References to include
                </h3>
                <ReferenceShareSelectionFields
                  verifiedReferences={verifiedReferences}
                  shareAllReferences={shareAllReferences}
                  selectedReferenceIds={selectedReferenceIds}
                  onShareAllChange={setShareAllReferences}
                  onSelectedChange={setSelectedReferenceIds}
                />
              </section>

              <section>
                <ReferenceSharePermissionsFields
                  permissions={permissions}
                  onChange={setPermissions}
                />
              </section>

              {mode === "link" ? (
                <section className="space-y-2">
                  <label
                    htmlFor="share-expiry"
                    className="text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Link expiry
                  </label>
                  <SelectField>
                    <select
                      id="share-expiry"
                      value={expiresInDays}
                      onChange={(event) =>
                        setExpiresInDays(Number(event.target.value))
                      }
                      className={`w-full appearance-none rounded-lg border border-gray-300 py-2 pl-3 ${SELECT_RIGHT_PADDING_CLASSNAME} text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {REFERENCE_EXPIRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </SelectField>
                </section>
              ) : (
                <section className="space-y-2">
                  <label
                    htmlFor="share-recruiter"
                    className="text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    Connected recruiter
                  </label>
                  {connectedRecruiters.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                      Connect with a recruiter first to share references directly
                      on their profile.
                    </div>
                  ) : (
                    <SelectField>
                      <select
                        id="share-recruiter"
                        value={selectedRecruiterId}
                        onChange={(event) =>
                          setSelectedRecruiterId(event.target.value)
                        }
                        className={`w-full appearance-none rounded-lg border border-gray-300 py-2 pl-3 ${SELECT_RIGHT_PADDING_CLASSNAME} text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select a recruiter…</option>
                        {connectedRecruiters.map((recruiter) => (
                          <option key={recruiter.recruiterId} value={recruiter.recruiterId}>
                            {recruiter.name} · {recruiter.company}
                          </option>
                        ))}
                      </select>
                    </SelectField>
                  )}
                </section>
              )}
            </>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Active share links
            </h3>
            {sharesPending ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Loading share links…
              </div>
            ) : activeShares.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                No active share links yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activeShares.map((share) => {
                  const expiryLabel = formatExpiry(share.expiresAt);

                  return (
                    <div
                      key={share.id}
                      className="rounded-lg border border-gray-200 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                            <Link2 className="h-4 w-4 shrink-0 text-blue-600" />
                            {formatShareLabel(
                              share.shareType,
                              share.includedReferenceIds.length,
                            )}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {share.shareUrl}
                          </p>
                          <p className="mt-2 text-xs text-gray-400">
                            {share.viewCount} view{share.viewCount === 1 ? "" : "s"}
                            {expiryLabel ? ` · ${expiryLabel}` : " · Never expires"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            aria-label="Copy share link"
                            onClick={() => void handleCopy(share.shareUrl)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Revoke share link"
                            disabled={revokingShareId === share.id}
                            onClick={() => void handleRevokeShare(share.id)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {revokingShareId === share.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Recruiter access
            </h3>
            {grantsPending ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Loading recruiter access…
              </div>
            ) : grants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                No recruiters currently have access to your references.
              </div>
            ) : (
              <div className="space-y-3">
                {grants.map((grant) => (
                  <div
                    key={grant.id}
                    className="rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {grant.recruiterName}
                          {grant.recruiterCompany
                            ? ` · ${grant.recruiterCompany}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatShareLabel(
                            grant.shareType,
                            grant.includedReferenceIds.length,
                          )}{" "}
                          · {formatGrantSource(grant.grantSource)}
                        </p>
                      </div>
                      {grant.grantSource === "manual" ? (
                        <button
                          type="button"
                          aria-label="Revoke recruiter access"
                          disabled={revokingGrantId === grant.id}
                          onClick={() => void handleRevokeGrant(grant.id)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {revokingGrantId === grant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            Close
          </button>
          {mode === "link" ? (
            <button
              type="button"
              disabled={!canCreateLink}
              onClick={() => void handleCreateShare()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
            >
              {createShare.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Generate Link
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={!canEmailShareLinkToRecruiter}
                onClick={() => void handleEmailShareLinkToRecruiter()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 sm:w-auto"
              >
                {sendShareLinkEmail.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send link by email
              </button>
              <button
                type="button"
                disabled={!canShareWithRecruiter}
                onClick={() => void handleShareWithRecruiter()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
              >
                {createGrant.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
                Share with Recruiter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
