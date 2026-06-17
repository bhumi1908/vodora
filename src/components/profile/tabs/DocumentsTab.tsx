import { ExternalLink, FileText } from "lucide-react";

import { formatDocumentType } from "@/lib/profile/format";
import type { CandidateProfileDocument } from "@/lib/profile/types";

type DocumentsTabProps = {
  documents: CandidateProfileDocument[];
  isOwnProfile: boolean;
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

export function DocumentsTab({ documents, isOwnProfile }: DocumentsTabProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        {isOwnProfile ? (
          <span className="text-sm text-gray-500">
            {documents.length} uploaded
          </span>
        ) : null}
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
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {document.name}
                  </p>
                  <p className="text-sm text-gray-500">
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
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
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
