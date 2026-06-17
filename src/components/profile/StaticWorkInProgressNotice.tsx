type StaticWorkInProgressNoticeProps = {
  section: string;
};

export function StaticWorkInProgressNotice({
  section,
}: StaticWorkInProgressNoticeProps) {
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
    >
      This {section} section uses static placeholder data — work in progress.
    </div>
  );
}
