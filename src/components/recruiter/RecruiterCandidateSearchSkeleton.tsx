import { Skeleton } from "@/components/ui/Skeleton";

export function RecruiterCandidateSearchSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      <Skeleton className="mb-6 h-14 w-full rounded-2xl" />

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <Skeleton className="mb-4 h-5 w-24" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="mb-4 border-b border-gray-100 pb-4">
                <Skeleton className="mb-3 h-4 w-28" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-3/4 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>

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
                      <Skeleton className="h-6 w-24 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
