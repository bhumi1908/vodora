"use client";

import type { ReferenceSharePermissions } from "@/lib/references/reference-permissions";
import { REFERENCE_PERMISSION_OPTIONS } from "@/lib/references/reference-permissions";

type ReferenceSharePermissionsFieldsProps = {
  permissions: ReferenceSharePermissions;
  onChange: (permissions: ReferenceSharePermissions) => void;
};

export function ReferenceSharePermissionsFields({
  permissions,
  onChange,
}: ReferenceSharePermissionsFieldsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        Visibility permissions
      </p>
      {REFERENCE_PERMISSION_OPTIONS.map((option) => (
        <label
          key={option.key}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-3 py-3"
        >
          <input
            type="checkbox"
            checked={permissions[option.key]}
            onChange={(event) => {
              onChange({
                ...permissions,
                [option.key]: event.target.checked,
              });
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">
              {option.label}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500">
              {option.description}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}
