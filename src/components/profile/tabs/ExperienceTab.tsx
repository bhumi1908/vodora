import { Briefcase } from "lucide-react";

import type { CandidateProfileExperience } from "@/lib/profile/types";

type ExperienceTabProps = {
  experience: CandidateProfileExperience[];
};

export function ExperienceTab({ experience }: ExperienceTabProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Experience</h2>
      {experience.length === 0 ? (
        <p className="text-sm text-gray-500">
          No work experience added yet.
        </p>
      ) : (
        <div className="space-y-6">
          {experience.map((entry) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100">
                <Briefcase className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                <p className="text-sm text-gray-600">{entry.company}</p>
                <p className="mb-2 text-xs text-gray-500">{entry.period}</p>
                {entry.location ? (
                  <p className="mb-2 text-xs text-gray-500">{entry.location}</p>
                ) : null}
                {entry.description ? (
                  <p className="text-sm text-gray-700">{entry.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
