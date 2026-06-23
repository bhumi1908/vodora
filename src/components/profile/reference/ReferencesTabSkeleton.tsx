import { Skeleton } from "@/components/ui/Skeleton";

function ReferenceCardSkeleton() {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>

            <Skeleton className="h-6 w-28 rounded-full" />
          </div>

          <div className="mt-4 space-y-2 border-l-4 border-gray-100 pl-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ReferencesTabSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading references">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      <div className="space-y-4">
        <ReferenceCardSkeleton />
        <ReferenceCardSkeleton />
      </div>
    </div>
  );
}
