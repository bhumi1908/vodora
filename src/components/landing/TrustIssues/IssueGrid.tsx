import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { IssueCard } from "./IssueCard";
import type { IssueItem } from "./constants";

interface IssueGridProps {
  readonly issues: readonly IssueItem[];
}

export function IssueGrid({ issues }: IssueGridProps) {
  return (
    <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-lg border border-[#E6E6E6] sm:grid-cols-2 lg:grid-cols-4 *:min-w-0">
      {issues.map((issue, index) => (
        <AnimateIn
          key={issue.number}
          delay={index * 70}
          variant="scale-in"
          className="flex h-full min-h-0 min-w-0 flex-col"
        >
          <IssueCard
            number={issue.number}
            title={issue.title}
            description={issue.description}
            index={index}
            total={issues.length}
          />
        </AnimateIn>
      ))}
    </div>
  );
}
