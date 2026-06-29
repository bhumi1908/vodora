"use client";

import { Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { ReferenceRespondForm } from "@/components/profile/reference/ReferenceRespondForm";
import { ReferenceRespondSkeleton } from "@/components/profile/reference/ReferenceRespondSkeleton";
import { ReferenceRespondSuccess } from "@/components/profile/reference/ReferenceRespondSuccess";
import type { ReferenceResponseFormData } from "@/components/profile/reference/types";
import type { ReferenceInvitationDetails } from "@/lib/references/fetch-reference-invitation";

type ReferenceRespondPageClientProps = {
  token: string;
  isAuthenticated: boolean;
  userEmail: string | null;
};

type SubmittedState = {
  status: "verified" | "submitted" | "rejected";
  responseId: string;
  form: ReferenceResponseFormData;
  welcomeRedirectTo?: string;
  profileSetupRequested?: boolean;
};

function PageHeader() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-semibold text-gray-900">Vodora</span>
          <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            Reference Verification
          </span>
        </div>
      </div>
    </div>
  );
}

function CenteredMessage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <div className="mt-3 text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
}

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
  const [submitted, setSubmitted] = useState<SubmittedState | null>(null);

  const loginRedirect = `/login?redirect=${encodeURIComponent(`/reference/respond?token=${token}`)}`;

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
    return <ReferenceRespondSkeleton />;
  }

  if (loadError || !invitation) {
    return (
      <CenteredMessage title="Invalid invitation">
        <p>{loadError}</p>
      </CenteredMessage>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <ReferenceRespondSuccess
          responseId={submitted.responseId}
          form={submitted.form}
          invitation={invitation}
          status={submitted.status}
          welcomeRedirectTo={submitted.welcomeRedirectTo}
          profileSetupRequested={submitted.profileSetupRequested}
        />
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <CenteredMessage title="Invitation expired">
        <p>
          This reference invitation is no longer valid. Please contact the candidate
          to request a new link.
        </p>
      </CenteredMessage>
    );
  }

  if (invitation.alreadySubmitted) {
    return (
      <CenteredMessage title="Already submitted">
        <p>A reference has already been submitted for this invitation.</p>
      </CenteredMessage>
    );
  }

  const emailMatches =
    isAuthenticated &&
    userEmail &&
    userEmail.trim().toLowerCase() === invitation.refereeEmail.trim().toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        {isAuthenticated && !emailMatches ? (
          <div className="hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-medium">Signed in as a different account</p>
            <p className="mt-2">
              You are signed in as <strong>{userEmail}</strong>, but this invitation
              was sent to <strong>{invitation.refereeEmail}</strong>. You can still
              complete the reference below — no account is required.
            </p>
            <div className="mt-4">
              <Link
                href={loginRedirect}
                className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Switch account
              </Link>
            </div>
          </div>
        ) : null}

        <ReferenceRespondForm
          invitation={invitation}
          token={token}
          onSubmitted={setSubmitted}
        />
      </div>
    </div>
  );
}
