import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { IssueCard } from "./IssueCard";
import type { IssueItem } from "./constants";

interface IssueGridProps {
  readonly issues: readonly IssueItem[];
}

export function IssueGrid({ issues }: IssueGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E6E6E6] rounded-lg overflow-hidden">
      {issues.map((issue, index) => (
        <AnimateIn key={issue.number} delay={index * 70} variant="scale-in">
          <IssueCard
            number={issue.number}
            title={issue.title}
            description={issue.description}
            isFirst={issue.isFirst}
          />
        </AnimateIn>
      ))}
    </div>
  );
}
