import { Skeleton } from "@/components/ui/Skeleton";

export function CandidateJobBoardSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <Skeleton className="mb-4 h-12 w-full rounded-2xl" />
      <Skeleton className="mb-6 h-10 w-full rounded-lg" />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <Skeleton className="mb-4 h-5 w-24" />
            {Array.from({ length: 3 }).map((_, index) => (
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

        <div className="flex min-w-0 flex-1 flex-col">
          <Skeleton className="mb-4 h-5 w-28" />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="w-full shrink-0 xl:w-80">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="mb-3 h-4 w-1/2" />
                    <Skeleton className="mb-3 h-3 w-full max-w-xs" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 xl:block">
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <Skeleton className="mb-4 h-8 w-2/3" />
                <Skeleton className="mb-6 h-4 w-1/3" />
                <div className="mb-6 flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="mb-3 h-5 w-32" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-9 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
