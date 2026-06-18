"use client";

import { ExternalLink, FileText, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  FormError,
  FormSelect,
  FormSuccess,
} from "@/components/auth/shared/FormFields";
import { ProfileEditSection } from "@/components/profile/edit/ProfileEditSection";
import type {
  CandidateProfileEditData,
  EditableDocument,
} from "@/components/profile/edit/types";
import { DOCUMENT_TYPE_OPTIONS } from "@/components/profile/edit/types";
import { formatDocumentType } from "@/lib/profile/format";
import {
  useDeleteProfileDocumentMutation,
  useUploadProfileDocumentMutation,
} from "@/lib/query/use-profile-mutations";
import {
  MAX_PROFILE_FILE_SIZE_LABEL,
  validateProfileFile,
} from "@/lib/profile/validation";

type DocumentsEditSectionProps = {
  documents: EditableDocument[];
  onChange: (profilePatch: Pick<CandidateProfileEditData, "documents">) => void;
  onDocumentsSaved?: (documents: EditableDocument[]) => void;
  onProfilePictureCleared?: () => void;
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

export function DocumentsEditSection({
  documents,
  onChange,
  onDocumentsSaved,
  onProfilePictureCleared,
}: DocumentsEditSectionProps) {
  const uploadMutation = useUploadProfileDocumentMutation();
  const deleteMutation = useDeleteProfileDocumentMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState("resume");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function clearSelectedFile() {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileSelected(file: File | null) {
    setError("");
    setSuccess("");

    if (!file) {
      clearSelectedFile();
      return;
    }

    const validationError = validateProfileFile(file);

    if (validationError) {
      setError(validationError);
      clearSelectedFile();
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        documentType,
        isPrimary: documentType === "resume",
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const nextDocuments = [result.document, ...documents];
      onChange({ documents: nextDocuments });
      onDocumentsSaved?.(nextDocuments);
      clearSelectedFile();
      setSuccess(`${formatDocumentType(documentType)} uploaded.`);
    } catch {
      setError("Failed to upload document.");
    }
  }

  async function handleDelete(document: EditableDocument) {
    setDeletingId(document.id);
    setError("");
    setSuccess("");

    try {
      const result = await deleteMutation.mutateAsync(document.id);

      if (!result.success) {
        setError(result.error ?? "Failed to delete document.");
        return;
      }

      const nextDocuments = documents.filter((item) => item.id !== document.id);
      onChange({ documents: nextDocuments });
      onDocumentsSaved?.(nextDocuments);

      if (document.type === "profile_photo") {
        onProfilePictureCleared?.();
      }

      setSuccess("Document removed.");
    } catch {
      setError("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ProfileEditSection
      id="profile-documents"
      title="Documents"
      description="Upload your resume, experience letters, certificates, and other supporting files."
    >
      <div className="rounded-lg border border-dashed border-gray-300 p-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <FormSelect
            id="document-type"
            label="Document Type"
            value={documentType}
            onChange={(event) => {
              setDocumentType(event.target.value);
              setError("");
              setSuccess("");
            }}
            options={[...DOCUMENT_TYPE_OPTIONS]}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Choose file
          </button>
        </div>

        {selectedFile ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                Ready to upload as {formatDocumentType(documentType)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={uploadMutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
              <button
                type="button"
                onClick={() => void handleUpload()}
                disabled={uploadMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploadMutation.isPending ? "Uploading..." : "Upload file"}
              </button>
            </div>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-gray-500">
          PDF, Word, JPEG, PNG, or WebP files up to {MAX_PROFILE_FILE_SIZE_LABEL}.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          handleFileSelected(file);
        }}
      />

      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">
          No documents uploaded yet. Add your resume or experience letter above.
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

              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => void handleDelete(document)}
                  disabled={deletingId === document.id}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === document.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Updated" message={success} /> : null}
    </ProfileEditSection>
  );
}
