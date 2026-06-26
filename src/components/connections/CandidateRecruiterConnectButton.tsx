"use client";

import { CheckCircle, Clock3, UserCheck, X } from "lucide-react";
import { useState } from "react";

import type { ProfileConnectionState } from "@/lib/connections/connection.types";
import {
  showConnectionRequestErrorToast,
  showConnectionRequestSentToast,
} from "@/lib/connections/connection-toast";
import type { RecruiterProfileData } from "@/lib/recruiter/recruiter-profile.types";
import { sendRecruiterConnectionRequest } from "@/lib/query/candidate-recruiter-fetchers";

function getFirstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function CandidateRecruiterConnectModal({
  profile,
  recruiterId,
  onClose,
  onSent,
}: {
  profile: RecruiterProfileData;
  recruiterId: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${getFirstName(profile.name)}, I came across your profile on Vodora and I'm interested in connecting. I'd love to explore opportunities you may be working on.`,
  );

  async function handleSend() {
    setIsPending(true);
    setSubmitError(null);

    try {
      await sendRecruiterConnectionRequest(recruiterId, message);
      setSent(true);
      showConnectionRequestSentToast(profile.name);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not send request.",
      );
      showConnectionRequestErrorToast();
    } finally {
      setIsPending(false);
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:mb-5 sm:h-16 sm:w-16">
            <CheckCircle className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">
            Connection Request Sent!
          </h2>
          <p className="mb-6 text-sm text-gray-500 sm:mb-8">
            Your request has been sent to{" "}
            <span className="font-medium text-gray-700">{profile.name}</span>.
          </p>
          <button
            type="button"
            onClick={onSent}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-none sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0 sm:p-8">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Connect with {getFirstName(profile.name)}
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              {profile.title ?? "Recruiter"}
              {profile.company ? ` · ${profile.company}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:space-y-5 sm:p-8">
          <div>
            <label
              htmlFor="candidate-recruiter-connect-message"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Personal message
            </label>
            <textarea
              id="candidate-recruiter-connect-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              {isPending ? "Sending..." : "Send Connection Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type CandidateRecruiterConnectButtonProps = {
  profile: RecruiterProfileData;
  recruiterId: string;
  connection: ProfileConnectionState;
  onConnectionChange?: () => void;
  compact?: boolean;
};

export function CandidateRecruiterConnectButton({
  profile,
  recruiterId,
  connection,
  onConnectionChange,
  compact = false,
}: CandidateRecruiterConnectButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const sizeClass = compact
    ? "gap-1.5 rounded-xl px-4 py-2 text-sm"
    : "gap-2 rounded-xl px-5 py-2.5 text-sm";

  if (connection?.status === "connected") {
    return (
      <span
        className={`inline-flex items-center border border-green-200 bg-green-50 font-semibold text-green-700 ${sizeClass}`}
      >
        <CheckCircle className="h-4 w-4 shrink-0" />
        Connected
      </span>
    );
  }

  if (connection?.status === "pending") {
    return (
      <span
        className={`inline-flex items-center border border-amber-200 bg-amber-50 font-semibold text-amber-700 ${sizeClass}`}
      >
        <Clock3 className="h-4 w-4 shrink-0" />
        {connection.initiatedBy === "candidate" ? "Pending" : "Request Pending"}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${sizeClass}`}
      >
        <UserCheck className="h-4 w-4 shrink-0" />
        Connect
      </button>

      {modalOpen ? (
        <CandidateRecruiterConnectModal
          profile={profile}
          recruiterId={recruiterId}
          onClose={() => setModalOpen(false)}
          onSent={() => {
            setModalOpen(false);
            onConnectionChange?.();
          }}
        />
      ) : null}
    </>
  );
}
