import { NumberBadge } from "./NumberBadge";

interface IssueCardProps {
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly index: number;
  readonly total: number;
}

function getCardBorderClasses(index: number, total: number) {
  const isLast = index === total - 1;
  const isTopRowOnTwoCol = index < total - 2;
  const isRightColumnOnTwoCol = index % 2 === 1;

  return [
    !isLast ? "border-b" : "",
    isTopRowOnTwoCol ? "sm:border-b" : "sm:border-b-0",
    isRightColumnOnTwoCol ? "sm:border-l" : "",
    "lg:border-b-0",
    index > 0 ? "lg:border-l" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function IssueCard({
  number,
  title,
  description,
  index,
  total,
}: IssueCardProps) {
  return (
    <article
      className={`flex h-full min-h-[300px] w-full min-w-0 flex-col bg-white p-5 sm:min-h-[360px] sm:p-6 lg:min-h-[430px] border-[#E6E6E6] ${getCardBorderClasses(index, total)}`}
    >
      <NumberBadge value={number} />
      <div className="mt-28 flex min-w-0 flex-col gap-2 sm:mt-36 md:mt-40 lg:mt-44 xl:mt-48">
        <h3 className="break-words text-lg font-bold leading-snug text-black sm:text-xl">
          {title}
        </h3>
        <p className="break-words text-base leading-relaxed text-black sm:text-lg">
          {description}
        </p>
      </div>
    </article>
  );
}
