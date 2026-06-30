"use client";

import { CheckCircle, MapPin, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CandidateSaveButton } from "@/components/recruiter/CandidateSaveButton";
import { getRecruiterCandidateProfilePath } from "@/lib/auth/routes";
import type { RecruiterCandidateCardData } from "@/lib/recruiter/dashboard.types";
import { formatCandidateCardAvailability } from "@/lib/recruiter/format-candidate-availability";
import { formatLocation, getInitials } from "@/lib/profile/format";

type RecruiterCandidateGridCardProps = {
  candidate: RecruiterCandidateCardData;
  onSavedChange?: (saved: boolean) => void;
};

export function RecruiterCandidateGridCard({
  candidate,
  onSavedChange,
}: RecruiterCandidateGridCardProps) {
  const router = useRouter();
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const location = formatLocation(candidate.city, candidate.country);
  const availability = formatCandidateCardAvailability(
    candidate.availabilityStatus,
    candidate.availabilityStart,
  );
  const isNotLooking = candidate.availabilityStatus === "not_looking";
  const initials = getInitials(candidate.firstName, candidate.lastName);
  const profilePath = getRecruiterCandidateProfilePath(candidate.vodoraId);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(profilePath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(profilePath);
        }
      }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="h-14 bg-gradient-to-r from-blue-500 to-blue-600" />
      <div className="-mt-7 px-5 pb-5">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-blue-100">
            {candidate.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={candidate.profilePictureUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-blue-700">{initials}</span>
            )}
          </div>
          <div onClick={(event) => event.stopPropagation()}>
            <CandidateSaveButton
              candidateId={candidate.id}
              initialSaved={candidate.isSaved}
              candidateName={fullName}
              onSavedChange={onSavedChange}
              variant="grid"
            />
          </div>
        </div>
        <div className="mb-0.5 flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-gray-900">{fullName}</h3>
          {candidate.verified ? (
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
          ) : null}
        </div>
        {candidate.title ? (
          <p className="mb-2 text-xs text-gray-600">{candidate.title}</p>
        ) : null}
        {location ? (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        ) : null}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
            <Shield className="h-3 w-3" />
            {candidate.referenceCount} references
          </span>
          <span
            className={`min-w-0 truncate text-right text-xs font-medium ${
              isNotLooking ? "text-gray-500" : "text-green-600"
            }`}
          >
            {availability}
          </span>
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <Link
            href={profilePath}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
}
