"use client";

import { Modal } from "@/components/ui/Modal";
import { SPOTLIGHT_BLOCK_TYPES } from "@/components/profile/spotlight/constants";
import type { SpotlightBlockType } from "@/lib/profile/spotlight.types";

type AddSpotlightBlockPickerProps = {
  open: boolean;
  onPick: (type: SpotlightBlockType) => void;
  onClose: () => void;
  excludedTypes?: SpotlightBlockType[];
};

export function AddSpotlightBlockPicker({
  open,
  onPick,
  onClose,
  excludedTypes = [],
}: AddSpotlightBlockPickerProps) {
  const availableTypes = SPOTLIGHT_BLOCK_TYPES.filter(
    (type) => !excludedTypes.includes(type.id),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to Your Spotlight"
      maxWidthClassName="max-w-md"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {availableTypes.map(({ id, label, desc, icon: Icon, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${color}`}
          >
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="mt-0.5 text-xs leading-snug text-gray-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
