import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

type ProfileSectionSkeletonProps = {
  titleWidth?: string;
  children: ReactNode;
  showAction?: boolean;
};

function ProfileSectionSkeleton({
  titleWidth = "w-36",
  children,
  showAction = true,
}: ProfileSectionSkeletonProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
          <Skeleton className={`h-5 ${titleWidth}`} />
        </div>
        {showAction ? <Skeleton className="h-8 w-20 shrink-0 rounded-lg" /> : null}
      </div>
      <div className="px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}

export function ProfileViewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      className="mx-auto max-w-5xl px-4 py-6"
    >
      <div className="relative z-10 mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="relative h-36 overflow-hidden rounded-t-xl">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute inset-0 flex items-center px-4 py-4 sm:px-8">
            <div className="ml-auto w-full max-w-md space-y-2 sm:max-w-xl lg:max-w-2xl">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        <div className="relative z-10 px-4 pb-6 sm:px-6">
          <div className="-mt-12 mb-4 flex items-end justify-between gap-4">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full border-4 border-white" />
            <div className="mb-1 hidden min-w-0 flex-1 md:block">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-36 rounded-full" />
                <Skeleton className="h-8 w-40 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-56 sm:w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-7 w-20 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="hidden h-20 w-20 shrink-0 rounded-full sm:block" />
          </div>

          <div className="mt-4 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <ProfileSectionSkeleton titleWidth="w-44" showAction={false}>
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 max-w-[90%]" />
        </div>
      </ProfileSectionSkeleton>

      <ProfileSectionSkeleton titleWidth="w-28">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 max-w-[85%]" />
              </div>
            </div>
          ))}
        </div>
      </ProfileSectionSkeleton>

      <ProfileSectionSkeleton titleWidth="w-40">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </ProfileSectionSkeleton>

      <ProfileSectionSkeleton titleWidth="w-28">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
      </ProfileSectionSkeleton>

      <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-4 py-4 sm:px-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="mr-4 h-8 w-28 shrink-0 rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 max-w-[80%]" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 max-w-[75%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
