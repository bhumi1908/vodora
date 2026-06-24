"use client";

import { ArrowLeft, Copy, Link2, Loader2, MapPin, Shield } from "lucide-react";
import Link from "next/link";

import { ReferenceCard } from "@/components/profile/reference/ReferenceCard";
import { getRecruiterCandidateProfilePath } from "@/lib/auth/routes";
import { useReferenceShareLinkQuery } from "@/lib/query/use-reference-queries";

type ReferenceSharePageClientProps = {
  token: string;
};

function formatLocation(city: string | null, country: string | null): string {
  return [city?.trim(), country?.trim()].filter(Boolean).join(", ");
}

export function ReferenceSharePageClient({ token }: ReferenceSharePageClientProps) {
  const { data, isPending, isError, error } = useReferenceShareLinkQuery(token);

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        Opening shared Reference Passport…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Share link unavailable
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {error instanceof Error
            ? error.message
            : "This link may be invalid, expired, or revoked."}
        </p>
        <Link
          href="/recruiter/dashboard"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const location = formatLocation(data.candidate.city, data.candidate.country);
  const profileHref = data.candidate.vodoraId
    ? getRecruiterCandidateProfilePath(data.candidate.vodoraId)
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/recruiter/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 sm:mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-lg font-semibold text-blue-700 sm:h-16 sm:w-16 sm:text-xl">
              {data.candidate.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.candidate.profilePictureUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                data.candidate.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Shared Reference Passport
              </p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                {data.candidate.name}
              </h1>
              {data.candidate.title ? (
                <p className="mt-1 text-sm text-gray-600">{data.candidate.title}</p>
              ) : null}
              {location ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {location}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              {data.references.length} verified reference
              {data.references.length === 1 ? "" : "s"} shared
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              {data.shareType === "full_passport"
                ? "Full passport"
                : "Selected references"}
            </span>
          </div>

          {profileHref ? (
            <Link
              href={profileHref}
              className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View full Vodora profile
            </Link>
          ) : null}
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {data.references.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              No verified references are included in this share link.
            </div>
          ) : (
            data.references.map((reference) => (
              <ReferenceCard
                key={reference.id}
                reference={reference}
                isOwnProfile={false}
                showRefereeContact={data.permissions.show_referee_contact}
                showVerificationStatus={data.permissions.show_verification_status}
                showRatings={data.permissions.show_ratings}
                showEmploymentConfirmation={
                  data.permissions.show_employment_confirmation
                }
                showWrittenComments={data.permissions.show_written_comments}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
