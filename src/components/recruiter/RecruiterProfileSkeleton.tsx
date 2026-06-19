import { Skeleton } from "@/components/ui/Skeleton";

export function RecruiterProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading recruiter profile"
      className="mx-auto max-w-5xl px-4 py-4 sm:py-8"
    >
      <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <Skeleton className="h-24 w-full rounded-none sm:h-32" />

        <div className="px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <div className="-mt-12 mb-5 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <Skeleton className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white sm:h-28 sm:w-28" />

            <div className="flex w-full flex-col gap-2 sm:mb-1 sm:w-auto sm:flex-row">
              <Skeleton className="h-10 w-full rounded-xl sm:w-32" />
              <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            </div>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Skeleton className="h-8 w-56 sm:w-64" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-5 w-48" />
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:block sm:text-right">
              <div className="flex items-center gap-1 sm:mb-1 sm:justify-end">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-4 rounded-sm sm:h-5 sm:w-5" />
                ))}
              </div>
              <Skeleton className="h-8 w-12 sm:ml-auto" />
              <Skeleton className="mt-1 h-3 w-24 sm:ml-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-center sm:p-5"
          >
            <Skeleton className="mx-auto mb-2 h-9 w-9 rounded-xl sm:mb-3 sm:h-10 sm:w-10" />
            <Skeleton className="mx-auto mb-2 h-7 w-16 sm:h-8" />
            <Skeleton className="mx-auto h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-4 py-3 sm:px-6 sm:py-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="mr-4 h-8 w-24 shrink-0 rounded-md sm:w-28" />
            ))}
          </div>
        </div>

        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          <div>
            <Skeleton className="mb-3 h-6 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 max-w-[85%]" />
          </div>

          <div>
            <Skeleton className="mb-3 h-6 w-36" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-32 rounded-xl" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="mb-3 h-6 w-28" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-28 rounded-xl" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 sm:gap-4 sm:p-4"
                >
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16 shrink-0 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
