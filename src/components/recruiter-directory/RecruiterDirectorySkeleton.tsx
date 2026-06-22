export function RecruiterDirectorySkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl"
        >
          <div className="flex items-start gap-3 p-4 sm:gap-5 sm:p-6">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-gray-100 sm:h-16 sm:w-16 sm:rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-100 sm:w-48" />
              <div className="h-4 w-full max-w-xs animate-pulse rounded bg-gray-100 sm:w-64" />
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100 sm:w-24" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100 sm:w-28" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 animate-pulse rounded-lg bg-gray-100 sm:w-20" />
                <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100 sm:w-24" />
              </div>
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100 sm:hidden" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
