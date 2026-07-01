interface NumberBadgeProps {
  readonly value: number;
}

export function NumberBadge({ value }: NumberBadgeProps) {
  return (
    <div
      className="flex size-[38px] items-center justify-center rounded-md bg-gray-900 text-xl text-white"
      aria-hidden="true"
    >
      {String(value).padStart(2, "0")}
    </div>
  );
}
