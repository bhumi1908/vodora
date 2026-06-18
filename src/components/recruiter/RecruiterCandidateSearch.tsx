"use client";

import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RecruiterCandidateGridCard } from "@/components/recruiter/RecruiterCandidateGridCard";
import { RecruiterCandidateListCard } from "@/components/recruiter/RecruiterCandidateListCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { RecruiterCandidateSearchSkeleton } from "@/components/recruiter/RecruiterCandidateSearchSkeleton";
import type {
  RecruiterSearchFilters,
  RecruiterSearchResult,
} from "@/lib/recruiter/search.types";
import { recruiterKeys } from "@/lib/query/keys";
import {
  fetchRecruiterSearchFilters,
  fetchRecruiterSearchResults,
  RECRUITER_SEARCH_PAGE_SIZE,
} from "@/lib/query/recruiter-fetchers";

const PAGE_SIZE = RECRUITER_SEARCH_PAGE_SIZE;

const EMPTY_RESULT: RecruiterSearchResult = {
  candidates: [],
  totalCount: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 0,
};

const availabilityOptions = ["All", "Immediately", "2 weeks", "1 month"];
const experienceLevels = ["Any", "0-3 years", "4-7 years", "8+ years"];
const referenceFilters = ["Any", "5+ references", "8+ references", "10+ references"];

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border-b border-gray-100 pb-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-gray-900"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open ? children : null}
    </div>
  );
}

type RecruiterCandidateSearchProps = {
  filters: RecruiterSearchFilters;
};

export function RecruiterCandidateSearch({
  filters: initialFilters,
}: RecruiterCandidateSearchProps) {
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
  const [view, setView] = useState<"list" | "grid">("list");

  const { data: filters = initialFilters } = useQuery({
    queryKey: recruiterKeys.filters(),
    queryFn: fetchRecruiterSearchFilters,
    initialData: initialFilters,
    staleTime: 5 * 60 * 1000,
  });

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
  } = useQuery({
    queryKey: recruiterKeys.search(searchParams),
    queryFn: () => fetchRecruiterSearchResults(searchParams),
  });

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

  const activeFilterCount = [
    selectedCategoryId !== "",
    selectedAvailability !== "All",
    selectedWorkTypeCodes.length > 0,
    selectedCountry !== "All",
    selectedExperience !== "Any",
    selectedRefs !== "Any",
  ].filter(Boolean).length;

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const categories = useMemo(
    () => [{ id: "", name: "All" }, ...filters.categories],
    [filters.categories],
  );

  const countries = useMemo(
    () => ["All", ...filters.countries],
    [filters.countries],
  );

  const filterPanel = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <FilterSection title="Category">
        <div className="space-y-1.5">
          {categories.map((category) => (
            <button
              key={category.id || "all"}
              type="button"
              onClick={() => {
                setSelectedCategoryId(category.id);
                setPage(1);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-1.5">
          {availabilityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelectedAvailability(option);
                setPage(1);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedAvailability === option
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Work Type">
        <div className="space-y-2">
          {filters.workTypes.map((workType) => (
            <label key={workType.code} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedWorkTypeCodes.includes(workType.code)}
                onChange={() => toggleWorkType(workType.code)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">{workType.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Country">
        <div className="space-y-1.5">
          {countries.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => {
                setSelectedCountry(country);
                setPage(1);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedCountry === country
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Experience" defaultOpen={false}>
        <div className="space-y-1.5">
          {experienceLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                setSelectedExperience(level);
                setPage(1);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedExperience === level
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="References" defaultOpen={false}>
        <div className="space-y-1.5">
          {referenceFilters.map((reference) => (
            <button
              key={reference}
              type="button"
              onClick={() => {
                setSelectedRefs(reference);
                setPage(1);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedRefs === reference
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {reference}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
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
          Browse {filters.totalDirectoryCount} verified professionals in the Vodora directory
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
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className={`rounded-lg p-2 ${
                  view === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 4h12v1.5H2zm0 3h12v1.5H2zm0 3h12v1.5H2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`rounded-lg p-2 ${
                  view === "grid"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2h6v6H1zm8 0h6v6H9zM1 10h6v6H1zm8 0h6v6H9z" />
                </svg>
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm font-medium text-red-900">Could not load candidates</p>
              <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
            </div>
          ) : isFetching && result.candidates.length === 0 ? (
            <CandidateResultsSkeleton view={view} />
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
          ) : view === "list" ? (
            <div className="space-y-3">
              {result.candidates.map((candidate) => (
                <RecruiterCandidateListCard
                  key={candidate.id}
                  candidate={candidate}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {result.candidates.map((candidate) => (
                <RecruiterCandidateGridCard
                  key={candidate.id}
                  candidate={candidate}
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
    </div>
  );
}

function CandidateResultsSkeleton({ view }: { view: "list" | "grid" }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
          >
            <Skeleton className="h-14 w-full rounded-none" />
            <div className="space-y-3 px-5 pb-5 pt-8">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
