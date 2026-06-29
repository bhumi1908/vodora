import { Shield } from "lucide-react";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

function PageHeader() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-semibold text-gray-900">Vodora</span>
          <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            Reference Verification
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
      <Skeleton className="h-6 w-48 sm:w-56" />
    </div>
  );
}

function FormFieldSkeleton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-full" : undefined}>
      <Skeleton className="mb-1.5 h-4 w-28" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

function FormCardSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      {children}
    </div>
  );
}

export function ReferenceRespondSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading reference invitation">
      <PageHeader />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <FormCardSkeleton>
          <Skeleton className="mb-4 h-4 w-56" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
          <Skeleton className="mt-4 h-20 w-full rounded-xl" />
          <Skeleton className="mt-3 h-8 w-full" />
        </FormCardSkeleton>

        <FormCardSkeleton>
          <SectionHeadingSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton fullWidth />
          </div>
        </FormCardSkeleton>

        <FormCardSkeleton>
          <SectionHeadingSkeleton />
          <Skeleton className="mb-4 h-4 w-52" />
          <div className="flex gap-6">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </FormCardSkeleton>

        <FormCardSkeleton>
          <SectionHeadingSkeleton />
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <FormFieldSkeleton key={index} fullWidth />
            ))}
          </div>
        </FormCardSkeleton>

        <FormCardSkeleton>
          <SectionHeadingSkeleton />
          <div className="space-y-5">
            <div>
              <Skeleton className="mb-1.5 h-4 w-40" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <FormFieldSkeleton fullWidth />
          </div>
        </FormCardSkeleton>

        <FormCardSkeleton>
          <SectionHeadingSkeleton />
          <Skeleton className="mb-5 h-28 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full max-w-md" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </FormCardSkeleton>

        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}
