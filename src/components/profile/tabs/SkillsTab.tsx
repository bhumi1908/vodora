import type { CandidateProfileSkill } from "@/lib/profile/types";

type SkillsTabProps = {
  skills: CandidateProfileSkill[];
};

function formatProficiency(proficiency: string | null): string | null {
  if (!proficiency) {
    return null;
  }

  return proficiency.charAt(0).toUpperCase() + proficiency.slice(1);
}

export function SkillsTab({ skills }: SkillsTabProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Skills</h2>
      {skills.length === 0 ? (
        <p className="text-sm text-gray-500">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const proficiency = formatProficiency(skill.proficiency);
            const label = proficiency
              ? `${skill.name} · ${proficiency}`
              : skill.name;

            return (
              <span
                key={skill.id}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
