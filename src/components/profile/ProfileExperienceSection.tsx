import { Briefcase } from "lucide-react";
import type { ReactNode } from "react";

import { ProfileSection } from "@/components/profile/ProfileSection";
import type { CandidateProfileExperience } from "@/lib/profile/types";

type ProfileExperienceSectionProps = {
  experience: CandidateProfileExperience[];
  editButton?: ReactNode;
};

export function ProfileExperienceSection({
  experience,
  editButton,
}: ProfileExperienceSectionProps) {
  return (
    <ProfileSection title="Experience" icon={Briefcase} action={editButton}>
      {experience.length === 0 ? (
        <p className="text-sm text-gray-500">No work experience added yet.</p>
      ) : (
        <div className="space-y-6">
          {experience.map((entry, index) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                {index < experience.length - 1 ? (
                  <div className="mt-2 mb-2 w-0.5 flex-1 bg-gray-100" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pb-2">
                <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                <p className="text-sm text-gray-600">{entry.company}</p>
                <p className="mb-2 text-xs text-gray-400">{entry.period}</p>
                {entry.location ? (
                  <p className="mb-2 text-xs text-gray-400">{entry.location}</p>
                ) : null}
                {entry.description ? (
                  <p className="text-sm leading-relaxed text-gray-700">
                    {entry.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileSection>
  );
}
