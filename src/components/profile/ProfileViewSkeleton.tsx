import { Skeleton } from "@/components/ui/Skeleton";

export function ProfileViewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      className="mx-auto max-w-5xl px-4 py-6 sm:px-6"
    >
      <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Skeleton className="h-32 w-full rounded-none" />

        <div className="px-6 pb-6">
          <div className="-mt-16 mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <Skeleton className="h-32 w-32 shrink-0 rounded-full border-4 border-white" />

            <div className="flex flex-wrap gap-2 lg:mb-2 lg:justify-end">
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-md" />
            ))}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 max-w-[83%]" />
          <Skeleton className="mt-6 h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
