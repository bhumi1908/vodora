import { GraduationCap } from "lucide-react";

import type { CandidateProfileEducation } from "@/lib/profile/types";

type EducationTabProps = {
  education: CandidateProfileEducation[];
};

export function EducationTab({ education }: EducationTabProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Education</h2>
      {education.length === 0 ? (
        <p className="text-sm text-gray-500">No education records added yet.</p>
      ) : (
        <div className="space-y-6">
          {education.map((entry) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100">
                <GraduationCap className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{entry.degree}</h3>
                <p className="text-sm text-gray-600">{entry.school}</p>
                <p className="text-xs text-gray-500">{entry.period}</p>
                {entry.description ? (
                  <p className="mt-2 text-sm text-gray-700">{entry.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
