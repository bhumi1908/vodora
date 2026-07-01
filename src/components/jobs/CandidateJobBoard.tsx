"use client";

import {
  ArrowLeft,
  Briefcase,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { JobApplyModal } from "@/components/jobs/JobApplyModal";
import { JobBoardDetailPanel } from "@/components/jobs/JobBoardDetailPanel";
import { JobBoardListCard } from "@/components/jobs/JobBoardListCard";
import { JobFiltersSidebar } from "@/components/jobs/JobFiltersSidebar";
import { CandidateJobBoardSkeleton } from "@/components/jobs/CandidateJobBoardSkeleton";
import { getTotalPages, Pagination } from "@/components/ui/Pagination";
import { getCandidateJobPath, CANDIDATE_JOBS_PATH } from "@/lib/auth/routes";
import { CANDIDATE_JOBS_PAGE_SIZE } from "@/lib/jobs/job-board-options";
import {
  useAppliedJobIdsQuery,
  usePublishedJobDetailQuery,
  usePublishedJobsQuery,
} from "@/lib/query/use-job-queries";
import { fetchJobBoardFilters } from "@/lib/query/job-fetchers";
import { jobKeys } from "@/lib/query/keys";
import { useQuery } from "@tanstack/react-query";

export function CandidateJobBoard() {
  return (
    <Suspense fallback={<CandidateJobBoardSkeleton />}>
      <CandidateJobBoardContent />
    </Suspense>
  );
}

function CandidateJobBoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobFromUrl = searchParams.get("job");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const queryParams = useMemo(
    () => ({
      category: selectedCategory,
      workTypes: selectedTypes,
      location: selectedLocation,
      industryCategoryId: selectedIndustryId,
      query: debouncedQuery,
      page,
      limit: CANDIDATE_JOBS_PAGE_SIZE,
    }),
    [
      debouncedQuery,
      page,
      selectedCategory,
      selectedIndustryId,
      selectedLocation,
      selectedTypes,
    ],
  );

  const { data: jobBoardFilters } = useQuery({
    queryKey: [...jobKeys.all, "filters"],
    queryFn: fetchJobBoardFilters,
    staleTime: 300_000,
  });

  const {
    data: jobsResult,
    isPending,
    isError,
    error,
  } = usePublishedJobsQuery(queryParams);

  const jobs = jobsResult?.jobs ?? [];
  const total = jobsResult?.total ?? 0;
  const totalPages = jobsResult?.totalPages ?? 0;
  const categoryCounts = jobsResult?.categoryCounts ?? {};

  const { data: selectedJobDetail } = usePublishedJobDetailQuery(selectedJobId);
  const { data: appliedJobIds = [] } = useAppliedJobIdsQuery();
  const appliedJobs = useMemo(() => new Set(appliedJobIds), [appliedJobIds]);

  const selectedJob =
    jobs.find((job) => job.id === selectedJobId) ??
    selectedJobDetail ??
    jobs[0] ??
    null;

  const applyingJob = applyingJobId
    ? jobs.find((job) => job.id === applyingJobId) ??
      (selectedJobDetail?.id === applyingJobId ? selectedJobDetail : null)
    : null;

  useEffect(() => {
    if (jobFromUrl) {
      setSelectedJobId(jobFromUrl);
      setMobileView("detail");
    }
  }, [jobFromUrl]);

  useEffect(() => {
    if (jobs.length === 0) {
      if (!jobFromUrl) {
        setSelectedJobId(null);
      }
      return;
    }

    if (selectedJobId) {
      const inList = jobs.some((job) => job.id === selectedJobId);
      const matchesDetail = selectedJobDetail?.id === selectedJobId;
      const matchesUrl = jobFromUrl === selectedJobId;

      if (inList || matchesDetail || matchesUrl) {
        return;
      }
    }

    if (!selectedJobId && !jobFromUrl) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId, selectedJobDetail, jobFromUrl]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type],
    );
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory("All");
    setSelectedTypes([]);
    setSelectedLocation("All Locations");
    setSelectedIndustryId(null);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setPage(1);
  }, []);

  const handleLocationChange = useCallback((location: string) => {
    setSelectedLocation(location);
    setPage(1);
  }, []);

  const handleSelectJob = useCallback(
    (jobId: string) => {
      setSelectedJobId(jobId);
      setMobileView("detail");
      router.replace(getCandidateJobPath(jobId), { scroll: false });
    },
    [router],
  );

  const handleIndustryChange = useCallback((industryId: string | null) => {
    setSelectedIndustryId(industryId);
    setPage(1);
  }, []);

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedTypes.length > 0,
    selectedLocation !== "All Locations",
    Boolean(selectedIndustryId),
  ].filter(Boolean).length;

  if (isPending && !jobsResult) {
    return <CandidateJobBoardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-semibold text-gray-900">Job Board</h1>
        <p className="text-gray-500">
          Browse {total} verified opportunit{total === 1 ? "y" : "ies"} posted
          by trusted recruiters
        </p>
      </div>

      {isError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Could not load jobs."}
        </div>
      ) : null}

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by job title, company, or category…"
          className="w-full rounded-2xl border border-gray-300 bg-white py-4 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex items-center gap-2 xl:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        {mobileView === "detail" ? (
          <button
            type="button"
            onClick={() => {
              setMobileView("list");
              router.replace(CANDIDATE_JOBS_PATH, { scroll: false });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </button>
        ) : null}
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <JobFiltersSidebar
              selectedCategory={selectedCategory}
              selectedTypes={selectedTypes}
              selectedLocation={selectedLocation}
              selectedIndustryId={selectedIndustryId}
              industries={jobBoardFilters?.industries ?? []}
              categoryCounts={categoryCounts}
              onCategoryChange={handleCategoryChange}
              onToggleType={toggleType}
              onLocationChange={handleLocationChange}
              onIndustryChange={handleIndustryChange}
              onClearFilters={clearFilters}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
            >
              Show {total} jobs
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <JobFiltersSidebar
          selectedCategory={selectedCategory}
          selectedTypes={selectedTypes}
          selectedLocation={selectedLocation}
          selectedIndustryId={selectedIndustryId}
          industries={jobBoardFilters?.industries ?? []}
          categoryCounts={categoryCounts}
          onCategoryChange={handleCategoryChange}
          onToggleType={toggleType}
          onLocationChange={handleLocationChange}
          onIndustryChange={handleIndustryChange}
          onClearFilters={clearFilters}
          className="hidden w-64 shrink-0 xl:block"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span> jobs
              found
            </p>
          </div>

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div
              className={`w-full shrink-0 xl:w-80 ${
                mobileView === "detail" ? "hidden xl:block" : "block"
              }`}
            >
              {total === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
                  <Briefcase className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No jobs match your filters
                  </p>
                  {activeFilterCount > 0 || query ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearFilters();
                        setQuery("");
                      }}
                      className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <JobBoardListCard
                      key={job.id}
                      job={job}
                      selected={selectedJobId === job.id}
                      applied={appliedJobs.has(job.id)}
                      onSelect={() => handleSelectJob(job.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedJob ? (
              <div
                className={`min-w-0 flex-1 ${
                  mobileView === "list" ? "hidden xl:block" : "block"
                }`}
              >
                <JobBoardDetailPanel
                  job={selectedJob}
                  applied={appliedJobs.has(selectedJob.id)}
                  onApply={() => setApplyingJobId(selectedJob.id)}
                />
              </div>
            ) : null}
          </div>

          {total > 0 && totalPages > 1 ? (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          ) : null}
        </div>
      </div>

      {applyingJob ? (
        <JobApplyModal
          job={applyingJob}
          open={Boolean(applyingJob)}
          onClose={() => setApplyingJobId(null)}
          onApplied={() => {
            /* applied job ids query is invalidated by submit mutation */
          }}
        />
      ) : null}
    </div>
  );
}
