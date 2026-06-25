import { Eye } from "lucide-react";

type VisitorPreviewBannerProps = {
  onExit: () => void;
};

export function VisitorPreviewBanner({ onExit }: VisitorPreviewBannerProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-amber-800">
        <Eye className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">
          Viewing as visitor — references are blurred and private controls hidden.
        </span>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="min-h-10 shrink-0 rounded-lg px-2 text-sm font-semibold text-amber-700 underline hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Back to my view
      </button>
    </div>
  );
}
