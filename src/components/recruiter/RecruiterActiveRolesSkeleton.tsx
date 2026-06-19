import { RecruiterJobCardSkeleton } from "@/components/recruiter/RecruiterJobCard";

export function RecruiterActiveRolesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <RecruiterJobCardSkeleton key={index} />
      ))}
    </div>
  );
}
