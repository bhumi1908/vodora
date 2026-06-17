import { formatCandidateAvailability } from "@/lib/profile/availability";

type OverviewTabProps = {
  about: string | null;
  availabilityStatus: string;
  availabilityStart: string | null;
};

export function OverviewTab({
  about,
  availabilityStatus,
  availabilityStart,
}: OverviewTabProps) {
  const availabilityLabel = formatCandidateAvailability(
    availabilityStatus,
    availabilityStart,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Availability</h2>
        <p className="text-sm text-gray-700">{availabilityLabel}</p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">About</h2>
        {about ? (
          <p className="leading-relaxed text-gray-700">{about}</p>
        ) : (
          <p className="text-sm text-gray-500">
            No summary added yet. Add a professional summary to help recruiters
            understand your background.
          </p>
        )}
      </div>
    </div>
  );
}
