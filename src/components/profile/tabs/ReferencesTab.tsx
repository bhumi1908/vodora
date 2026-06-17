import { Users } from "lucide-react";

import { staticReferences } from "@/components/profile/static-data";
import { StaticWorkInProgressNotice } from "@/components/profile/StaticWorkInProgressNotice";

type ReferencesTabProps = {
  isOwnProfile: boolean;
};

export function ReferencesTab({ isOwnProfile }: ReferencesTabProps) {
  return (
    <div>
      <StaticWorkInProgressNotice section="References" />

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">References</h2>
        {isOwnProfile ? (
          <span className="text-sm text-gray-500">
            {staticReferences.length} placeholder references
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        {staticReferences.map((reference) => (
          <div
            key={reference.id}
            className="flex gap-4 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{reference.name}</h3>
                  <p className="text-sm text-gray-600">
                    {reference.title} · {reference.company}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    reference.status === "Verified"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {reference.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Relationship: {reference.relationship}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
