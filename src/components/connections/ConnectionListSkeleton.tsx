import { Skeleton } from "@/components/ui/Skeleton";

export function ConnectionListSkeleton() {
  return (
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
