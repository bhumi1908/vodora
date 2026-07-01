import { NumberBadge } from "./NumberBadge";
import type { IssueItem } from "./constants";

type IssueCardProps = IssueItem;

export function IssueCard({ number, title, description, isFirst }: IssueCardProps) {
  return (
    <div className={`flex min-h-[430px] flex-1 flex-col gap-[208px] bg-white p-6 border-b lg:border-b-0 border-[#E6E6E6] ${isFirst ? "border-l-0" : "border-l-0 sm:border-l"}`}>
      <NumberBadge value={number} />
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold leading-snug text-black">{title}</h3>
        <p className="text-xl leading-relaxed text-black">{description}</p>
      </div>
    </div>
  );
}
