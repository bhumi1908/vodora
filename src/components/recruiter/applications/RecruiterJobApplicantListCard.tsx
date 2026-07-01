"use client";

import { ChevronRight, FileText, MapPin, Shield } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/recruiter/applications/ApplicationStatusBadge";
import { ApplicantNewBadge } from "@/components/recruiter/applications/ApplicantNewBadge";
import type { RecruiterJobApplicantSummary } from "@/lib/jobs/recruiter-job-applications.types";

type RecruiterJobApplicantListCardProps = {
  applicant: RecruiterJobApplicantSummary;
  selected: boolean;
  onSelect: () => void;
};

export function RecruiterJobApplicantListCard({
  applicant,
  selected,
  onSelect,
}: RecruiterJobApplicantListCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-blue-300 bg-blue-50/60 shadow-sm ring-1 ring-blue-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {applicant.profilePictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={applicant.profilePictureUrl}
              alt=""
              className="h-12 w-12 rounded-xl border border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
              {applicant.avatarInitials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
              {applicant.name}
            </h3>
            <ApplicationStatusBadge status={applicant.status} compact />
            {applicant.isNew ? <ApplicantNewBadge compact /> : null}
          </div>

          {applicant.title ? (
            <p className="mb-1 truncate text-sm text-gray-600">{applicant.title}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {applicant.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {applicant.location}
              </span>
            ) : null}
            <span>Applied {applicant.appliedLabel}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {applicant.resume ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                <FileText className="h-3 w-3" />
                Resume
              </span>
            ) : null}
            {applicant.coverLetter ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                Cover letter
              </span>
            ) : null}
            {applicant.referencesAttached ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-green-700">
                <Shield className="h-3 w-3" />
                {applicant.referenceCount} reference
                {applicant.referenceCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>

        <ChevronRight
          className={`mt-1 h-4 w-4 shrink-0 ${
            selected ? "text-blue-600" : "text-gray-300"
          }`}
        />
      </div>
    </button>
  );
}
