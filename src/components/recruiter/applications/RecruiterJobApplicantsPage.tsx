"use client";

import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Search,
  SearchX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RecruiterJobApplicantDetailPanel } from "@/components/recruiter/applications/RecruiterJobApplicantDetailPanel";
import { RecruiterJobApplicantListCard } from "@/components/recruiter/applications/RecruiterJobApplicantListCard";
import { NavigationBackLink } from "@/components/ui/NavigationBackLink";
import { getTotalPages, Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { RECRUITER_PROFILE_ROLES_PATH } from "@/lib/auth/routes";
import { RECRUITER_JOB_APPLICANTS_PAGE_SIZE } from "@/lib/jobs/job-board-options";
import { useRecruiterJobApplicantsQuery } from "@/lib/query/use-job-queries";

type RecruiterJobApplicantsPageProps = {
  jobId: string;
};

type MobileView = "list" | "detail";

export function RecruiterJobApplicantsPage({ jobId }: RecruiterJobApplicantsPageProps) {
  const { data, isPending, isError, error } = useRecruiterJobApplicantsQuery(jobId);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    null,
  );

  const applicants = data?.applicants ?? [];
  const job = data?.job;

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return applicants;
    }

    return applicants.filter((applicant) => {
      const haystack = [
        applicant.name,
        applicant.title,
        applicant.company,
        applicant.email,
        applicant.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [applicants, searchQuery]);

  const totalPages = getTotalPages(
    filteredApplicants.length,
    RECRUITER_JOB_APPLICANTS_PAGE_SIZE,
  );

  const paginatedApplicants = useMemo(() => {
    const start = (page - 1) * RECRUITER_JOB_APPLICANTS_PAGE_SIZE;
    return filteredApplicants.slice(start, start + RECRUITER_JOB_APPLICANTS_PAGE_SIZE);
  }, [filteredApplicants, page]);

  const listRangeLabel = useMemo(() => {
    if (filteredApplicants.length === 0) {
      return null;
    }

    const start = (page - 1) * RECRUITER_JOB_APPLICANTS_PAGE_SIZE + 1;
    const end = Math.min(
      page * RECRUITER_JOB_APPLICANTS_PAGE_SIZE,
      filteredApplicants.length,
    );

    return `${start}–${end} of ${filteredApplicants.length}`;
  }, [filteredApplicants.length, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const hasActiveSearch = searchQuery.trim().length > 0;
  const isSearchEmpty =
    hasActiveSearch && filteredApplicants.length === 0 && applicants.length > 0;

  useEffect(() => {
    if (isSearchEmpty) {
      setMobileView("list");
      return;
    }

    if (filteredApplicants.length === 0) {
      if (applicants.length === 0) {
        setSelectedApplicationId(null);
        setMobileView("list");
      }
      return;
    }

    const stillVisible = filteredApplicants.some(
      (applicant) => applicant.applicationId === selectedApplicationId,
    );

    if (!stillVisible) {
      setSelectedApplicationId(filteredApplicants[0]?.applicationId ?? null);
      setMobileView("list");
    }
  }, [applicants.length, filteredApplicants, isSearchEmpty, selectedApplicationId]);

  useEffect(() => {
    if (!selectedApplicationId && applicants.length > 0) {
      setSelectedApplicationId(applicants[0].applicationId);
    }
  }, [applicants, selectedApplicationId]);

  const handleSelectApplicant = useCallback((applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setMobileView("detail");
  }, []);

  const handleBackToList = useCallback(() => {
    setMobileView("list");
  }, []);

  const detailApplicationId = useMemo(() => {
    if (isSearchEmpty) {
      return null;
    }

    if (
      selectedApplicationId &&
      applicants.some(
        (applicant) => applicant.applicationId === selectedApplicationId,
      )
    ) {
      return selectedApplicationId;
    }

    return applicants[0]?.applicationId ?? null;
  }, [applicants, isSearchEmpty, selectedApplicationId]);

  const detailApplicant = applicants.find(
    (applicant) => applicant.applicationId === detailApplicationId,
  );

  if (isPending) {
    return <RecruiterJobApplicantsPageSkeleton />;
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-10 sm:px-6">
        <NavigationBackLink
          fallbackHref={RECRUITER_PROFILE_ROLES_PATH}
          label="Back"
        />
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : "Could not load applicants."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
      <NavigationBackLink
        fallbackHref={RECRUITER_PROFILE_ROLES_PATH}
        label="Back"
      />

      <header className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="bg-linear-to-r from-gray-900 via-blue-950 to-blue-900 px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-200">
                Role applicants
              </p>
              <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                {job.title}
              </h1>
              <p className="mt-1 text-sm text-blue-100">{job.company}</p>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{job.applicantCount}</p>
                <p className="text-xs text-blue-100">applicants</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 shrink-0" />
            {job.type}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {job.location}
          </span>
          <span className="font-medium text-gray-700">{job.salary}</span>
          {job.urgent ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              Urgent
            </span>
          ) : null}
        </div>
      </header>

      {applicants.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            No applicants yet
          </h2>
          <p className="mx-auto max-w-md text-sm text-gray-500">
            When candidates apply to this role, their applications, cover letters,
            resumes, and shared references will appear here.
          </p>
        </div>
      ) : (
        <>
          {mobileView === "detail" ? (
            <div className="mt-4 lg:hidden">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Back to applicants
              </button>
            </div>
          ) : null}

          {isSearchEmpty ? (
            <div className="mt-6 space-y-4">
              <ApplicantSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <ApplicantSearchEmptyState
                searchQuery={searchQuery.trim()}
                onClear={() => setSearchQuery("")}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <aside
                className={`space-y-4 ${
                  mobileView === "detail" ? "hidden lg:block" : "block"
                }`}
              >
                <ApplicantSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                />

                {listRangeLabel ? (
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {listRangeLabel}
                    </span>{" "}
                    applicant{filteredApplicants.length === 1 ? "" : "s"}
                  </p>
                ) : null}

                <div className="space-y-3 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-1">
                  {paginatedApplicants.map((applicant) => (
                    <RecruiterJobApplicantListCard
                      key={applicant.applicationId}
                      applicant={applicant}
                      selected={applicant.applicationId === selectedApplicationId}
                      onSelect={() =>
                        handleSelectApplicant(applicant.applicationId)
                      }
                    />
                  ))}
                </div>

                {filteredApplicants.length > 0 && totalPages > 1 ? (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="pt-1"
                  />
                ) : null}
              </aside>

              <div
                className={`min-w-0 ${
                  mobileView === "list" ? "hidden lg:block" : "block"
                }`}
              >
                {detailApplicant && detailApplicationId ? (
                  <RecruiterJobApplicantDetailPanel
                    jobId={jobId}
                    applicationId={detailApplicationId}
                    summaryName={detailApplicant.name}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
                    Select an applicant to review their application.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ApplicantSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search applicants…"
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function ApplicantSearchEmptyState({
  searchQuery,
  onClear,
}: {
  searchQuery: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center sm:py-20">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        <SearchX className="h-8 w-8 text-blue-400" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        No candidates found
      </h2>
      <p className="mx-auto max-w-md text-sm text-gray-500">
        {searchQuery ? (
          <>
            No applicants match{" "}
            <span className="font-medium text-gray-700">
              &ldquo;{searchQuery}&rdquo;
            </span>
            . Try a different name, role, company, or location.
          </>
        ) : (
          "Try adjusting your search terms."
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        Clear search
      </button>
    </div>
  );
}

function RecruiterJobApplicantsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-36 rounded-2xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="hidden h-[520px] rounded-2xl lg:block" />
      </div>
    </div>
  );
}
