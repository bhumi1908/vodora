import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

type ProfileViewSkeletonProps = {
  showBackLink?: boolean;
};

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

export function ProfileViewSkeleton({
  showBackLink = false,
}: ProfileViewSkeletonProps = {}) {
  return (
    <>
      {showBackLink ? (
        <div className="mx-auto max-w-5xl px-3 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-5 w-40" />
        </div>
      ) : null}

      <div
        aria-busy="true"
        aria-label="Loading profile"
        className="mx-auto max-w-5xl overflow-x-hidden px-4 py-6"
      >
        <div className="relative z-10 mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Skeleton className="h-32 w-full rounded-none sm:h-36" />

          <div className="relative z-10 px-4 pb-6 sm:px-6">
            <div className="-mt-12 mb-4 flex items-end justify-between gap-4 sm:-mt-14">
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white sm:h-28 sm:w-28" />
              <div className="mb-1 hidden min-w-0 flex-1 md:block">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Skeleton className="h-9 w-28 rounded-xl" />
                  <Skeleton className="h-9 w-32 rounded-xl" />
                  <Skeleton className="h-9 w-36 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-56 sm:w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </div>

            <div className="mt-4 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <ProfileSectionSkeleton titleWidth="w-36">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 max-w-[90%]" />
          </div>
        </ProfileSectionSkeleton>

        <ProfileSectionSkeleton titleWidth="w-32">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </ProfileSectionSkeleton>

        <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto px-4 py-4 sm:px-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="mr-4 h-8 w-28 shrink-0 rounded-md"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 max-w-[85%]" />
          </div>
        </div>
      </div>
    </>
  );
}
