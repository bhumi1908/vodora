import { ExternalLink, FileText } from "lucide-react";

import type { RecruiterJobApplicationDocument } from "@/lib/jobs/recruiter-job-applications.types";
import { formatDocumentType } from "@/lib/profile/format";

type ApplicationDocumentRowProps = {
  document: RecruiterJobApplicationDocument;
};

function formatUploadedDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ApplicationDocumentRow({ document }: ApplicationDocumentRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {document.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatDocumentType(document.type)}
            {" · "}
            {formatUploadedDate(document.uploadedAt)}
          </p>
        </div>
      </div>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:self-auto"
      >
        View
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
