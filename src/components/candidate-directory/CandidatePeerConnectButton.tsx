"use client";

import { CheckCircle, Clock3, UserCheck, X } from "lucide-react";
import { useState } from "react";

import type { CandidatePeerSearchCandidate } from "@/lib/candidate/candidate-peer-search.types";
import {
  showConnectionRequestErrorToast,
  showConnectionRequestSentToast,
} from "@/lib/connections/connection-toast";
import { useCandidatePeerConnectMutation } from "@/lib/query/use-candidate-peer-queries";
import { formatLocation, getInitials } from "@/lib/profile/format";

function getFirstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

type CandidatePeerConnectModalProps = {
  candidate: CandidatePeerSearchCandidate;
  onClose: () => void;
  onConnected: () => void;
};

export function CandidatePeerConnectModal({
  candidate,
  onClose,
  onConnected,
}: CandidatePeerConnectModalProps) {
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `Hi ${getFirstName(fullName)}, I came across your profile on Vodora and I'd like to connect with you.`,
  );

  const mutation = useCandidatePeerConnectMutation();

  async function handleSend() {
    try {
      await mutation.mutateAsync({
        candidateId: candidate.id,
        message,
      });
      setSubmitError(null);
      setSent(true);
      showConnectionRequestSentToast(fullName);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not send request.",
      );
      showConnectionRequestErrorToast();
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Connection Request Sent!
          </h2>
          <p className="mb-8 text-gray-500">
            Your request has been sent to{" "}
            <span className="font-medium text-gray-700">{fullName}</span>.
          </p>
          <button
            type="button"
            onClick={onConnected}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const initials = getInitials(candidate.firstName, candidate.lastName);
  const location = formatLocation(candidate.city, candidate.country);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between p-8 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100">
              {candidate.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidate.profilePictureUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-blue-700">{initials}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect with {getFirstName(fullName)}
              </h2>
              <p className="text-sm text-gray-500">
                {candidate.title ?? "Professional"}
                {location ? ` · ${location}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-8">
          <div>
            <label
              htmlFor="peer-connect-message"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Personal message
            </label>
            <textarea
              id="peer-connect-message"
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={mutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              <UserCheck className="h-4 w-4" />
              {mutation.isPending ? "Sending..." : "Send Connection Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type CandidatePeerConnectButtonProps = {
  candidate: CandidatePeerSearchCandidate;
  onConnect: (candidate: CandidatePeerSearchCandidate) => void;
  compact?: boolean;
};

export function CandidatePeerConnectButton({
  candidate,
  onConnect,
  compact = false,
}: CandidatePeerConnectButtonProps) {
  const sizeClass = compact
    ? "gap-1 px-2.5 py-1 text-xs"
    : "gap-1.5 px-4 py-2 text-sm";

  if (candidate.connectionStatus === "connected") {
    return (
      <span
        className={`inline-flex items-center rounded-xl border border-green-200 bg-green-50 font-semibold text-green-700 ${sizeClass}`}
      >
        <CheckCircle className={compact ? "h-3 w-3" : "h-4 w-4"} />
        Connected
      </span>
    );
  }

  if (candidate.connectionStatus === "pending") {
    return (
      <span
        className={`inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 font-semibold text-amber-700 ${sizeClass}`}
      >
        <Clock3 className={compact ? "h-3 w-3" : "h-4 w-4"} />
        Pending
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onConnect(candidate)}
      className={`inline-flex items-center rounded-xl bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${sizeClass}`}
    >
      <UserCheck className={compact ? "h-3 w-3" : "h-4 w-4"} />
      Connect
    </button>
  );
}
