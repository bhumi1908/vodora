import { ProfileViewSkeleton } from "@/components/profile/ProfileViewSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RecruiterCandidateProfileLoading() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-3 pt-4 sm:px-6 sm:pt-6">
        <Skeleton className="h-5 w-40" />
      </div>
      <ProfileViewSkeleton />
    </>
  );
}
