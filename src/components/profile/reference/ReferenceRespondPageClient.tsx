"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ReferenceRespondForm } from "@/components/profile/reference/ReferenceRespondForm";
import type { ReferenceInvitationDetails } from "@/lib/references/fetch-reference-invitation";

type ReferenceRespondPageClientProps = {
  token: string;
  isAuthenticated: boolean;
  userEmail: string | null;
};

export function ReferenceRespondPageClient({
  token,
  isAuthenticated,
  userEmail,
}: ReferenceRespondPageClientProps) {
  const [invitation, setInvitation] = useState<ReferenceInvitationDetails | null>(
    null,
  );
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submittedStatus, setSubmittedStatus] = useState<
    "verified" | "submitted" | null
  >(null);

  const loginRedirect = `/login?redirect=${encodeURIComponent(`/reference/respond?token=${token}`)}`;
  const signupRedirect = `/signup/candidate?redirect=${encodeURIComponent(`/reference/respond?token=${token}`)}&email=${encodeURIComponent(invitation?.refereeEmail ?? "")}`;

  useEffect(() => {
    async function loadInvitation() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          `/api/reference/invitation?token=${encodeURIComponent(token)}`,
        );
        const result = (await response.json()) as {
          success: boolean;
          invitation?: ReferenceInvitationDetails;
          error?: string;
        };

        if (!response.ok || !result.success || !result.invitation) {
          setLoadError(result.error ?? "Unable to load invitation.");
          setInvitation(null);
          return;
        }

        setInvitation(result.invitation);
      } catch {
        setLoadError("Unable to load invitation.");
        setInvitation(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadInvitation();
  }, [token]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-gray-500">
        Loading reference invitation...
      </div>
    );
  }

  if (loadError || !invitation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invalid invitation</h1>
        <p className="mt-3 text-sm text-gray-600">{loadError}</p>
      </div>
    );
  }

  if (submittedStatus) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Reference submitted</h1>
        <p className="mt-3 text-sm text-gray-600">
          {submittedStatus === "verified"
            ? "Thank you. Your reference has been verified and added to the candidate's Reference Passport."
            : "Thank you. Your reference has been submitted and is awaiting admin verification."}
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invitation expired</h1>
        <p className="mt-3 text-sm text-gray-600">
          This reference invitation is no longer valid. Please contact the candidate
          to request a new link.
        </p>
      </div>
    );
  }

  if (invitation.alreadySubmitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Already submitted</h1>
        <p className="mt-3 text-sm text-gray-600">
          A reference has already been submitted for this invitation.
        </p>
      </div>
    );
  }

  const emailMatches =
    isAuthenticated &&
    userEmail &&
    userEmail.trim().toLowerCase() === invitation.refereeEmail.trim().toLowerCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Complete Reference</h1>
        <p className="mt-2 text-sm text-gray-600">
          Provide a verified professional reference for {invitation.candidateName}.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">Sign in required</p>
          <p className="mt-2">
            Create a free Vodora candidate account or sign in using{" "}
            <strong>{invitation.refereeEmail}</strong> to complete this reference.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href={signupRedirect}
              className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create account
            </Link>
            <Link
              href={loginRedirect}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : null}

      {isAuthenticated && !emailMatches ? (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          You are signed in as <strong>{userEmail}</strong>, but this invitation was
          sent to <strong>{invitation.refereeEmail}</strong>. Please sign in with the
          invited email address.
          <div className="mt-4">
            <Link
              href={loginRedirect}
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Switch account
            </Link>
          </div>
        </div>
      ) : null}

      {emailMatches ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ReferenceRespondForm
            invitation={invitation}
            token={token}
            onSubmitted={setSubmittedStatus}
          />
        </div>
      ) : null}
    </div>
  );
}
