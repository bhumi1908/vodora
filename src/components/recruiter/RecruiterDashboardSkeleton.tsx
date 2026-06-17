import { Skeleton } from "@/components/ui/Skeleton";
import { RecruiterDashboardHeaderSkeleton } from "@/components/recruiter/RecruiterDashboardHeaderSkeleton";

export function RecruiterDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <RecruiterDashboardHeaderSkeleton />

      <Skeleton className="mb-4 h-12 w-full rounded-lg" />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
            <Skeleton className="mb-2 h-9 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Skeleton className="h-7 w-48" />
          {Array.from({ length: 3 }).map((_, index) => (
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
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded-lg" />
                    <Skeleton className="h-6 w-14 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="mb-3 h-16 w-full rounded-xl" />
            <Skeleton className="mb-3 h-16 w-full rounded-xl" />
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
