type TagPillSelectorProps = {
  id: string;
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  variant?: "blue" | "gray";
};

export function TagPillSelector({
  id,
  label,
  options,
  value,
  onChange,
  error,
  variant = "blue",
}: TagPillSelectorProps) {
  function toggleOption(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }

    onChange([...value, option]);
  }

  const selectedClassName =
    variant === "blue"
      ? "border-blue-600 bg-blue-50 text-blue-700"
      : "border-gray-600 bg-gray-100 text-gray-800";

  const unselectedClassName =
    variant === "blue"
      ? "border-blue-100 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50";

  return (
    <div>
      <p
        id={`${id}-label`}
        className="mb-3 block text-sm font-medium text-gray-700"
      >
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const selected = value.includes(option);

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleOption(option)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                selected ? selectedClassName : unselectedClassName
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
