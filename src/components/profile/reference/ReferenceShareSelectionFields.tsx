"use client";

import type { CandidateReferenceItem } from "@/lib/references/fetch-candidate-references";

type ReferenceShareSelectionFieldsProps = {
  verifiedReferences: CandidateReferenceItem[];
  shareAllReferences: boolean;
  selectedReferenceIds: string[];
  onShareAllChange: (shareAll: boolean) => void;
  onSelectedChange: (referenceIds: string[]) => void;
};

export function ReferenceShareSelectionFields({
  verifiedReferences,
  shareAllReferences,
  selectedReferenceIds,
  onShareAllChange,
  onSelectedChange,
}: ReferenceShareSelectionFieldsProps) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-4 py-3">
        <input
          type="radio"
          name="share-scope"
          checked={shareAllReferences}
          onChange={() => onShareAllChange(true)}
          className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">
            Full Reference Passport
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            Share all {verifiedReferences.length} verified reference
            {verifiedReferences.length === 1 ? "" : "s"}.
          </span>
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-4 py-3">
        <input
          type="radio"
          name="share-scope"
          checked={!shareAllReferences}
          onChange={() => onShareAllChange(false)}
          className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">
            Selected references only
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            Choose which verified references to include.
          </span>
        </span>
      </label>

      {!shareAllReferences ? (
        <div className="space-y-2 pl-1">
          {verifiedReferences.map((reference) => (
            <label
              key={reference.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3"
            >
              <input
                type="checkbox"
                checked={selectedReferenceIds.includes(reference.id)}
                onChange={(event) => {
                  onSelectedChange(
                    event.target.checked
                      ? [...selectedReferenceIds, reference.id]
                      : selectedReferenceIds.filter((id) => id !== reference.id),
                  );
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  {reference.refereeName}
                </span>
                <span className="block text-xs text-gray-500">
                  {reference.refereeTitle} at {reference.refereeCompany}
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildSharingPayload(
  shareAllReferences: boolean,
  selectedReferenceIds: string[],
  verifiedCount: number,
) {
  const sharingAll =
    shareAllReferences ||
    (selectedReferenceIds.length === verifiedCount && verifiedCount > 0);

  return {
    shareType: sharingAll
      ? ("full_passport" as const)
      : ("selected_references" as const),
    includedReferenceIds: sharingAll ? undefined : selectedReferenceIds,
  };
}

export { buildSharingPayload };
