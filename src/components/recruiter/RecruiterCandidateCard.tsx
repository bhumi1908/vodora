"use client";

import {
  Bookmark,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { getRecruiterCandidateProfilePath } from "@/lib/auth/routes";
import type { RecruiterDashboardCandidate } from "@/lib/recruiter/dashboard.types";
import { formatCandidateAvailability } from "@/lib/recruiter/format-candidate-availability";
import { formatLocation, getInitials } from "@/lib/profile/format";

type RecruiterCandidateCardProps = {
  candidate: RecruiterDashboardCandidate;
};

export function RecruiterCandidateCard({ candidate }: RecruiterCandidateCardProps) {
  const [saved, setSaved] = useState(false);
  const location = formatLocation(candidate.city, candidate.country);
  const availability = formatCandidateAvailability(
    candidate.availabilityStatus,
    candidate.availabilityStart,
    candidate.workTypes,
  );
  const initials = getInitials(candidate.firstName, candidate.lastName);
  const fullName = `${candidate.firstName} ${candidate.lastName}`.trim();

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
          <div className="flex items-start justify-between gap-2">
            <div>
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
                <p className="mt-0.5 text-sm text-gray-600">{candidate.title}</p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                {location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500" />
                  {candidate.referenceCount} verified references
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-500" />
                  Available: {availability}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSaved((current) => !current)}
                aria-label={saved ? "Remove saved profile" : "Save profile"}
                className={`rounded-lg p-2 transition-colors ${
                  saved
                    ? "bg-amber-50 text-amber-500"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${saved ? "fill-amber-500" : ""}`}
                />
              </button>
              <Link
                href={getRecruiterCandidateProfilePath(candidate.vodoraId)}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                View Profile
              </Link>
            </div>
          </div>

          {candidate.skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
