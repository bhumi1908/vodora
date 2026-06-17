type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] motion-safe:animate-[shimmer_1.5s_ease-in-out_infinite] ${className}`}
    />
  );
}
