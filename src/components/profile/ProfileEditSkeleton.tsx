import { Skeleton } from "@/components/ui/Skeleton";

export function ProfileEditSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile editor"
      className="mx-auto max-w-3xl px-4 py-6 sm:px-6"
    >
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-lg border border-gray-200 bg-white p-6"
          >
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
