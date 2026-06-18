"use client";

import { CheckCircle, Clock, MapPin, Shield } from "lucide-react";
import Link from "next/link";

import { CandidateSaveButton } from "@/components/recruiter/CandidateSaveButton";
import { getRecruiterCandidateProfilePath } from "@/lib/auth/routes";
import type { RecruiterCandidateCardData } from "@/lib/recruiter/dashboard.types";
import { formatCandidateAvailability } from "@/lib/recruiter/format-candidate-availability";
import { formatLocation, getInitials } from "@/lib/profile/format";

function formatExperience(years: number | null | undefined): string | null {
  if (years === null || years === undefined) {
    return null;
  }

  return `${years} ${years === 1 ? "year" : "years"}`;
}

type RecruiterCandidateListCardProps = {
  candidate: RecruiterCandidateCardData;
  onSavedChange?: (saved: boolean) => void;
};

export function RecruiterCandidateListCard({
  candidate,
  onSavedChange,
}: RecruiterCandidateListCardProps) {
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const location = formatLocation(candidate.city, candidate.country);
  const availability = formatCandidateAvailability(
    candidate.availabilityStatus,
    candidate.availabilityStart,
    candidate.workTypes,
  );
  const experience = formatExperience(candidate.totalYearsExperience);
  const initials = getInitials(candidate.firstName, candidate.lastName);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
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

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900">{fullName}</h3>
                {candidate.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                ) : null}
              </div>
              {candidate.title ? (
                <p className="text-sm text-gray-600">{candidate.title}</p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500" />
                  {candidate.referenceCount} verified refs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-500" />
                  Available: {availability}
                </span>
                {experience ? (
                  <span className="text-gray-400">{experience} exp.</span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <CandidateSaveButton
                candidateId={candidate.id}
                initialSaved={candidate.isSaved}
                candidateName={fullName}
                onSavedChange={onSavedChange}
              />
              <Link
                href={getRecruiterCandidateProfilePath(candidate.vodoraId)}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                View Profile
              </Link>
            </div>
          </div>

          {candidate.skills.length > 0 || candidate.workTypes.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {skill}
                </span>
              ))}
              {candidate.workTypes.map((workType) => (
                <span
                  key={workType}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600"
                >
                  {workType}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
