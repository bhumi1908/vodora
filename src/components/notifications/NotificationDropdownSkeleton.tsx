import { Skeleton } from "@/components/ui/Skeleton";

export function NotificationDropdownHeaderSkeleton() {
  return (
    <>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
        <Skeleton className="mt-1 h-3 w-16" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
    </>
  );
}

export function NotificationDropdownSkeleton() {
  return (
    <div
      className="space-y-1 px-2 py-2"
      role="status"
      aria-label="Loading notifications"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3 rounded-lg px-3 py-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full max-w-[16rem]" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
