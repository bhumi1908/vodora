import { ExternalLink, FileText } from "lucide-react";
import type { ReactNode } from "react";

import { formatDocumentType } from "@/lib/profile/format";
import type { CandidateProfileDocument } from "@/lib/profile/types";

type DocumentsTabProps = {
  documents: CandidateProfileDocument[];
  isOwnProfile: boolean;
  editButton?: ReactNode;
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

export function DocumentsTab({
  documents,
  isOwnProfile,
  editButton,
}: DocumentsTabProps) {
  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            Documents
          </h2>
          {isOwnProfile ? (
            <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
              {documents.length} uploaded
            </span>
          ) : null}
        </div>
        {editButton ? <div className="shrink-0 self-start">{editButton}</div> : null}
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">
          No documents uploaded yet.
          {isOwnProfile ? " Upload your resume and supporting files here." : ""}
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100 sm:h-10 sm:w-10">
                  <FileText className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 sm:text-base">
                    {document.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500 sm:text-sm">
                    {formatDocumentType(document.type)}
                    {document.isPrimary ? " · Primary" : ""}
                    {" · "}
                    {formatUploadedDate(document.uploadedAt)}
                  </p>
                </div>
              </div>

              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-blue-600 hover:text-blue-700 sm:self-auto"
              >
                View
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
