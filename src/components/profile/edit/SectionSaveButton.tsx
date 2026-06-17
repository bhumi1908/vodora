type SectionSaveButtonProps = {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function SectionSaveButton({
  label = "Save section",
  loading = false,
  disabled = false,
  onClick,
}: SectionSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Saving..." : label}
    </button>
  );
}
