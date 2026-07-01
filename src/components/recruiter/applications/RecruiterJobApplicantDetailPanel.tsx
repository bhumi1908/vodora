"use client";

import {
  Briefcase,
  ChevronRight,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { CustomSelect } from "@/components/shared/SelectField";
import { ApplicationDocumentRow } from "@/components/recruiter/applications/ApplicationDocumentRow";
import { ApplicationStatusBadge } from "@/components/recruiter/applications/ApplicationStatusBadge";
import { ProfileEducationSection } from "@/components/profile/ProfileEducationSection";
import { ProfileExperienceSection } from "@/components/profile/ProfileExperienceSection";
import { ReferenceCard } from "@/components/profile/reference/ReferenceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getRecruiterCandidateProfilePath } from "@/lib/auth/routes";
import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import { JOB_APPLICATION_STATUS_OPTIONS } from "@/lib/jobs/map-application-status";
import type { RecruiterJobApplicantDetail } from "@/lib/jobs/recruiter-job-applications.types";
import { formatWebsiteHref, formatWebsiteLabel } from "@/lib/profile/format";
import {
  useMarkRecruiterJobApplicantAsReadMutation,
  useRecruiterJobApplicantDetailQuery,
  useUpdateRecruiterJobApplicantStatusMutation,
} from "@/lib/query/use-job-queries";

type RecruiterJobApplicantDetailPanelProps = {
  jobId: string;
  applicationId: string;
  summaryName: string;
};

export function RecruiterJobApplicantDetailPanel({
  jobId,
  applicationId,
  summaryName,
}: RecruiterJobApplicantDetailPanelProps) {
  const {
    data: applicant,
    isPending,
    isError,
    error,
  } = useRecruiterJobApplicantDetailQuery(jobId, applicationId);

  const updateStatusMutation = useUpdateRecruiterJobApplicantStatusMutation(jobId);
  const { mutate: markAsRead } = useMarkRecruiterJobApplicantAsReadMutation(jobId);
  const markAsReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (markAsReadTimerRef.current) {
      clearTimeout(markAsReadTimerRef.current);
      markAsReadTimerRef.current = null;
    }

    if (isPending || isError || !applicant?.isNew) {
      return;
    }

    markAsReadTimerRef.current = setTimeout(() => {
      markAsRead({ applicationId });
    }, 1000);

    return () => {
      if (markAsReadTimerRef.current) {
        clearTimeout(markAsReadTimerRef.current);
        markAsReadTimerRef.current = null;
      }
    };
  }, [applicationId, applicant?.isNew, isError, isPending, markAsRead]);

  if (isPending) {
    return <RecruiterJobApplicantDetailSkeleton name={summaryName} />;
  }

  if (isError || !applicant) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Could not load application details."}
        </p>
      </div>
    );
  }

  function handleStatusChange(nextStatus: JobApplicationStatus) {
    if (nextStatus === applicant?.status) {
      return;
    }

    updateStatusMutation.mutate({
      applicationId,
      status: nextStatus,
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {applicant.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={applicant.profilePictureUrl}
                alt=""
                className="h-16 w-16 rounded-2xl border border-white object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
                {applicant.avatarInitials}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {applicant.name}
              </h2>
              {applicant.title ? (
                <p className="mt-0.5 text-sm text-gray-600">{applicant.title}</p>
              ) : null}
              {applicant.company ? (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  {applicant.company}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-gray-400">
                Applied {applicant.appliedLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <ApplicationStatusBadge status={applicant.status} />
            <label className="flex w-full flex-col gap-1.5 text-sm text-gray-500 sm:w-52">
              Update status
              <CustomSelect
                id="applicant-status-select"
                value={applicant.status}
                onChange={(event) =>
                  handleStatusChange(event.target.value as JobApplicationStatus)
                }
                disabled={updateStatusMutation.isPending}
                options={JOB_APPLICATION_STATUS_OPTIONS.map((status) => ({
                  value: status,
                  label: status,
                }))}
                allowEmpty={false}
                size="default"
                rounded="xl"
                className="w-full font-medium text-gray-700"
                rightAdornment={
                  updateStatusMutation.isPending ? (
                    <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-blue-600" />
                  ) : undefined
                }
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
          <ContactRow icon={Mail} label="Email" value={applicant.email} />
          {applicant.phone ? (
            <ContactRow icon={Phone} label="Phone" value={applicant.phone} />
          ) : null}
          {applicant.location ? (
            <ContactRow icon={MapPin} label="Location" value={applicant.location} />
          ) : null}
        </div>

        <Link
          href={getRecruiterCandidateProfilePath(applicant.vodoraId)}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          <User className="h-4 w-4" />
          View full profile
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          Cover letter
        </h3>
        {applicant.coverLetter ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
            {applicant.coverLetter}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No cover letter provided.</p>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Documents</h3>
        <div className="space-y-3">
          {applicant.resume ? (
            <ApplicationDocumentRow document={applicant.resume} />
          ) : (
            <EmptyDocumentNotice label="Resume not available." />
          )}
          {applicant.coverLetterDocument ? (
            <ApplicationDocumentRow document={applicant.coverLetterDocument} />
          ) : null}
        </div>
      </section>

      <ReferencesSection applicant={applicant} />

      <ApplicantProfileDetailsSection applicant={applicant} />
    </div>
  );
}

function ApplicantProfileDetailsSection({
  applicant,
}: {
  applicant: RecruiterJobApplicantDetail;
}) {
  const hasAbout = Boolean(applicant.about?.trim());
  const hasWebsite = Boolean(applicant.website?.trim());
  const hasSkills = applicant.skills.length > 0;

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          Contact &amp; profile
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ContactRow icon={Mail} label="Email" value={applicant.email} />
          {applicant.phone ? (
            <ContactRow icon={Phone} label="Phone" value={applicant.phone} />
          ) : null}
          {applicant.location ? (
            <ContactRow icon={MapPin} label="Location" value={applicant.location} />
          ) : null}
          {hasWebsite && applicant.website ? (
            <div className="flex items-start gap-2 text-sm">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Website</p>
                <a
                  href={formatWebsiteHref(applicant.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-blue-600 hover:text-blue-700"
                >
                  {formatWebsiteLabel(applicant.website)}
                </a>
              </div>
            </div>
          ) : null}
        </div>
        {hasAbout && applicant.about ? (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="mb-2 text-xs font-medium text-gray-500">About</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
              {applicant.about}
            </p>
          </div>
        ) : null}
      </section>

      <ProfileExperienceSection experience={applicant.experience} />

      <ProfileEducationSection education={applicant.education} />

      {hasSkills ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.map((skill) => {
              const proficiency = skill.proficiency
                ? skill.proficiency.charAt(0).toUpperCase() +
                  skill.proficiency.slice(1)
                : null;
              const label = proficiency
                ? `${skill.name} · ${proficiency}`
                : skill.name;

              return (
                <span
                  key={skill.id}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}

function ReferencesSection({
  applicant,
}: {
  applicant: RecruiterJobApplicantDetail;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">References</h3>
        {applicant.referencesAttached ? (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            Shared with application
          </span>
        ) : null}
      </div>

      {!applicant.referencesAttached ? (
        <p className="text-sm text-gray-500">
          This candidate did not share references with this application.
        </p>
      ) : applicant.references.length === 0 ? (
        <p className="text-sm text-gray-500">
          References were shared but none are available to view yet.
        </p>
      ) : (
        <div className="space-y-4">
          {applicant.references.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              isOwnProfile={false}
              showRefereeContact={false}
              showVerificationStatus
              showRatings
              showEmploymentConfirmation
              showWrittenComments
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="truncate font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function EmptyDocumentNotice({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500">
      {label}
    </div>
  );
}

function RecruiterJobApplicantDetailSkeleton({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading {name}…</p>
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
