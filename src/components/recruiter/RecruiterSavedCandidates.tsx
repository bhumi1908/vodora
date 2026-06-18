"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useState } from "react";

import { RecruiterCandidateListCard } from "@/components/recruiter/RecruiterCandidateListCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import type { RecruiterSearchResult } from "@/lib/recruiter/search.types";
import { recruiterKeys } from "@/lib/query/keys";
import {
  fetchRecruiterSavedCandidates,
  RECRUITER_SAVED_PAGE_SIZE,
} from "@/lib/query/recruiter-fetchers";

const EMPTY_RESULT: RecruiterSearchResult = {
  candidates: [],
  totalCount: 0,
  page: 1,
  limit: RECRUITER_SAVED_PAGE_SIZE,
  totalPages: 0,
};

export function RecruiterSavedCandidates() {
  const [page, setPage] = useState(1);

  const { data: result = EMPTY_RESULT, isPending, isFetching, error } =
    useQuery({
      queryKey: recruiterKeys.saved(page, RECRUITER_SAVED_PAGE_SIZE),
      queryFn: () => fetchRecruiterSavedCandidates(page, RECRUITER_SAVED_PAGE_SIZE),
    });

  const loading = isPending && result.candidates.length === 0;
  const errorMessage =
    error instanceof Error ? error.message : "Could not load saved candidates.";

  const handleSavedChange = (candidateId: string, saved: boolean) => {
    if (saved) {
      return;
    }

    const nextTotalCount = Math.max(0, result.totalCount - 1);
    const nextTotalPages =
      nextTotalCount > 0 ? Math.ceil(nextTotalCount / result.limit) : 0;
    const nextPage =
      result.page > nextTotalPages && nextTotalPages > 0
        ? nextTotalPages
        : result.page;

    if (nextPage !== page) {
      setPage(nextPage);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Candidates</h1>
        <p className="mt-1 text-sm text-gray-600">
          Profiles you have bookmarked for later review.
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{result.totalCount}</span>{" "}
          saved {result.totalCount === 1 ? "profile" : "profiles"}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-900">Could not load saved candidates</p>
          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
        </div>
      ) : loading ? (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : result.candidates.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
          <Bookmark className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-500">No saved candidates yet</p>
          <p className="mt-2 text-sm text-gray-400">
            Bookmark profiles while searching to build your shortlist.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {result.candidates.map((candidate) => (
            <RecruiterCandidateListCard
              key={candidate.id}
              candidate={candidate}
              onSavedChange={(saved) => handleSavedChange(candidate.id, saved)}
            />
          ))}
        </div>
      )}

      {!loading && !isFetching && result.totalPages > 1 ? (
        <Pagination
          currentPage={page}
          totalPages={result.totalPages}
          onPageChange={setPage}
          className="mt-8"
        />
      ) : null}
    </div>
  );
}
