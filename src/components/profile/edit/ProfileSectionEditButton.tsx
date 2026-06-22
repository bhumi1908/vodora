import { Pencil, Plus } from "lucide-react";

type ProfileSectionEditButtonProps = {
  hasContent: boolean;
  sectionLabel: string;
  onClick: () => void;
  className?: string;
};

export function ProfileSectionEditButton({
  hasContent,
  sectionLabel,
  onClick,
  className = "",
}: ProfileSectionEditButtonProps) {
  const Icon = hasContent ? Pencil : Plus;
  const label = hasContent ? `Edit ${sectionLabel}` : `Add ${sectionLabel}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}
