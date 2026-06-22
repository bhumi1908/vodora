type VisitorPreviewBannerProps = {
  onExit: () => void;
};

export function VisitorPreviewBanner({ onExit }: VisitorPreviewBannerProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
      <p>
        You&apos;re viewing your profile as a visitor. References are blurred and
        private controls are hidden.
      </p>
      <button
        type="button"
        onClick={onExit}
        className="shrink-0 font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950"
      >
        Back to my view
      </button>
    </div>
  );
}
