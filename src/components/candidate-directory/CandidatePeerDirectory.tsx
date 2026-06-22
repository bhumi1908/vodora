"use client";

import { Search, SlidersHorizontal, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CandidatePeerConnectModal,
} from "@/components/candidate-directory/CandidatePeerConnectButton";
import { CandidatePeerListCard } from "@/components/candidate-directory/CandidateDirectoryListCard";
import {
  CandidateSearchFiltersPanel,
  getActiveCandidateSearchFilterCount,
} from "@/components/candidate-directory/CandidateSearchFiltersPanel";
import { RecruiterCandidateSearchSkeleton } from "@/components/recruiter/RecruiterCandidateSearchSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import type { CandidatePeerSearchCandidate } from "@/lib/candidate/candidate-peer-search.types";
import type { CandidatePeerSearchFilters } from "@/lib/candidate/candidate-peer-search.types";
import { CANDIDATE_PEER_SEARCH_PAGE_SIZE } from "@/lib/query/candidate-peer-keys";
import {
  useCandidatePeerSearchFiltersQuery,
  useCandidatePeerSearchQuery,
} from "@/lib/query/use-candidate-peer-queries";

const PAGE_SIZE = CANDIDATE_PEER_SEARCH_PAGE_SIZE;

const EMPTY_RESULT = {
  candidates: [] as CandidatePeerSearchCandidate[],
  totalCount: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 0,
};

function isMissingRpcError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("search_candidates_for_candidates") ||
    normalized.includes("get_candidate_search_metadata") ||
    normalized.includes("could not find the function") ||
    normalized.includes("schema cache")
  );
}

type CandidatePeerDirectoryProps = {
  filters: CandidatePeerSearchFilters;
};

export function CandidatePeerDirectory({ filters: initialFilters }: CandidatePeerDirectoryProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedWorkTypeCodes, setSelectedWorkTypeCodes] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("Any");
  const [selectedRefs, setSelectedRefs] = useState("Any");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [connecting, setConnecting] = useState<CandidatePeerSearchCandidate | null>(null);

  const { data: filters = initialFilters } = useCandidatePeerSearchFiltersQuery();

  const filterState = useMemo(
    () => ({
      selectedCategoryId,
      selectedAvailability,
      selectedWorkTypeCodes,
      selectedCountry,
      selectedExperience,
      selectedRefs,
    }),
    [
      selectedAvailability,
      selectedCategoryId,
      selectedCountry,
      selectedExperience,
      selectedRefs,
      selectedWorkTypeCodes,
    ],
  );

  const searchParams = useMemo(
    () => ({
      query: debouncedQuery,
      categoryId: selectedCategoryId,
      availability: selectedAvailability,
      workTypeCodes: selectedWorkTypeCodes,
      country: selectedCountry,
      experience: selectedExperience,
      references: selectedRefs,
      page,
      limit: PAGE_SIZE,
    }),
    [
      debouncedQuery,
      page,
      selectedAvailability,
      selectedCategoryId,
      selectedCountry,
      selectedExperience,
      selectedRefs,
      selectedWorkTypeCodes,
    ],
  );

  const {
    data: result = EMPTY_RESULT,
    isPending,
    isFetching,
    error,
  } = useCandidatePeerSearchQuery(searchParams);

  const loading = isPending && result.candidates.length === 0;
  const errorMessage =
    error instanceof Error ? error.message : "Could not load candidates.";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const activeFilterCount = getActiveCandidateSearchFilterCount(filterState);

  const clearFilters = useCallback(() => {
    setSelectedCategoryId("");
    setSelectedAvailability("All");
    setSelectedWorkTypeCodes([]);
    setSelectedCountry("All");
    setSelectedExperience("Any");
    setSelectedRefs("Any");
    setPage(1);
  }, []);

  const toggleWorkType = (code: string) => {
    setSelectedWorkTypeCodes((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
    setPage(1);
  };

  const resetPage = () => setPage(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const filterPanel = (
    <CandidateSearchFiltersPanel
      filters={filters}
      state={filterState}
      onCategoryChange={(categoryId) => {
        setSelectedCategoryId(categoryId);
        resetPage();
      }}
      onAvailabilityChange={(availability) => {
        setSelectedAvailability(availability);
        resetPage();
      }}
      onWorkTypeToggle={toggleWorkType}
      onCountryChange={(country) => {
        setSelectedCountry(country);
        resetPage();
      }}
      onExperienceChange={(experience) => {
        setSelectedExperience(experience);
        resetPage();
      }}
      onReferencesChange={(references) => {
        setSelectedRefs(references);
        resetPage();
      }}
      onClearAll={clearFilters}
    />
  );

  if (loading && !error) {
    return <RecruiterCandidateSearchSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Find Candidates
        </h1>
        <p className="text-sm text-gray-500 sm:text-base">
          Browse {filters.totalDirectoryCount} verified professionals in the Vodora
          directory
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, title, skill, or location…"
          className="w-full rounded-2xl border border-gray-300 bg-white py-4 pr-4 pl-12 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((open) => !open)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {mobileFiltersOpen ? (
        <>
          <button
            type="button"
            aria-label="Close filters"
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <aside className="fixed inset-x-4 top-24 z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl lg:hidden">
            {filterPanel}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white"
            >
              Show results
            </button>
          </aside>
        </>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5">
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{result.totalCount}</span>{" "}
              candidates found
              {isFetching && !loading ? (
                <span className="ml-2 text-gray-400">Updating…</span>
              ) : null}
            </p>
          </div>

          {error ? (
            <div
              className={`rounded-2xl border p-8 text-center ${
                isMissingRpcError(errorMessage)
                  ? "border-amber-200 bg-amber-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isMissingRpcError(errorMessage)
                    ? "text-amber-900"
                    : "text-red-900"
                }`}
              >
                {isMissingRpcError(errorMessage)
                  ? "Database setup required"
                  : "Could not load candidates"}
              </p>
              <p
                className={`mt-2 text-sm ${
                  isMissingRpcError(errorMessage)
                    ? "text-amber-800"
                    : "text-red-700"
                }`}
              >
                {isMissingRpcError(errorMessage) ? (
                  <>
                    Apply the Supabase migration{" "}
                    <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
                      20250622800000_search_candidates_for_candidates.sql
                    </code>{" "}
                    in your Supabase project, then refresh this page.
                  </>
                ) : (
                  errorMessage
                )}
              </p>
            </div>
          ) : isFetching && result.candidates.length === 0 ? (
            <CandidateResultsSkeleton />
          ) : result.candidates.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">No candidates match your filters</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {result.candidates.map((candidate) => (
                <CandidatePeerListCard
                  key={candidate.id}
                  candidate={candidate}
                  onConnect={setConnecting}
                />
              ))}
            </div>
          )}

          {!isFetching && result.totalPages > 1 ? (
            <Pagination
              currentPage={page}
              totalPages={result.totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          ) : null}
        </div>
      </div>

      {connecting ? (
        <CandidatePeerConnectModal
          candidate={connecting}
          onClose={() => setConnecting(null)}
          onConnected={() => setConnecting(null)}
        />
      ) : null}
    </div>
  );
}

function CandidateResultsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-full max-w-md" />
              <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-14 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
