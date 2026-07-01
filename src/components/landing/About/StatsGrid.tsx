import { Fragment } from "react";

import { StatCard } from "./StatCard";
import type { StatItem } from "./constants";

interface StatsGridProps {
  readonly stats: readonly StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="flex items-start">
      {stats.map((stat, index) => (
        <Fragment key={stat.value}>
          {index > 0 && (
            <div className="mx-8 w-px self-stretch bg-gray-200 sm:mx-12" aria-hidden="true" />
          )}
          <StatCard value={stat.value} label={stat.label} />
        </Fragment>
      ))}
    </div>
  );
}
