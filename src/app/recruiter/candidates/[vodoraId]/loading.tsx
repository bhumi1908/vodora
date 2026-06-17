import { ProfileViewSkeleton } from "@/components/profile/ProfileViewSkeleton";

export default function RecruiterCandidateProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" />
      <ProfileViewSkeleton />
    </div>
  );
}
