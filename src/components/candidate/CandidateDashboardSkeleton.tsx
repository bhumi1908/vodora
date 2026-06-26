import { Skeleton } from "@/components/ui/Skeleton";
import { CandidateDashboardHeaderSkeleton } from "@/components/candidate/CandidateDashboardHeader";
import { CandidateDashboardStatsSkeleton } from "@/components/candidate/CandidateDashboardStaticSections";

export function CandidateDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <CandidateDashboardHeaderSkeleton />
      <CandidateDashboardStatsSkeleton />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Skeleton className="h-7 w-48" />
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-full max-w-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="mb-4 h-2 w-full rounded-full" />
            <Skeleton className="mb-3 h-4 w-full" />
            <Skeleton className="mb-3 h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
