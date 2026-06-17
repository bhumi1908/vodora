import { Skeleton } from "@/components/ui/Skeleton";

export function RecruiterDashboardHeaderSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading recruiter dashboard header"
      className="mb-8 flex items-center justify-between"
    >
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="hidden gap-3 sm:flex">
        <Skeleton className="h-11 w-40 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
