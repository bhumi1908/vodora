type ApplicantNewBadgeProps = {
  compact?: boolean;
};

export function ApplicantNewBadge({ compact = false }: ApplicantNewBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-red-200 bg-red-50 font-semibold text-red-600 ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      New
    </span>
  );
}
