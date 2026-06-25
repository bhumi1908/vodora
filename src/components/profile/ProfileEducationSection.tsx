import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

import { ProfileSection } from "@/components/profile/ProfileSection";
import type { CandidateProfileEducation } from "@/lib/profile/types";

type ProfileEducationSectionProps = {
  education: CandidateProfileEducation[];
  editButton?: ReactNode;
};

export function ProfileEducationSection({
  education,
  editButton,
}: ProfileEducationSectionProps) {
  return (
    <ProfileSection title="Education" icon={GraduationCap} action={editButton}>
      {education.length === 0 ? (
        <p className="text-sm text-gray-500">No education records added yet.</p>
      ) : (
        <div className="space-y-4">
          {education.map((entry) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{entry.degree}</h3>
                <p className="text-sm text-gray-600">{entry.school}</p>
                <p className="text-xs text-gray-400">{entry.period}</p>
                {entry.description ? (
                  <p className="mt-2 text-sm text-gray-700">{entry.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
