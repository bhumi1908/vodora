"use client";

import { Flame, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AddSpotlightBlockPicker } from "@/components/profile/spotlight/AddSpotlightBlockPicker";
import { SpotlightBlockEditor } from "@/components/profile/spotlight/SpotlightBlockEditor";
import { SpotlightBlockView } from "@/components/profile/spotlight/SpotlightBlockViews";
import {
  showSpotlightBlockAddedToast,
  showSpotlightBlockDeletedToast,
  showSpotlightBlockUpdatedToast,
  showSpotlightSaveErrorToast,
} from "@/lib/profile/spotlight-toast";
import { useSaveSpotlightMutation } from "@/lib/query/use-profile-mutations";
import type { SpotlightBlock, SpotlightBlockType } from "@/lib/profile/spotlight.types";

type PersistSpotlightOptions = {
  addedType?: SpotlightBlockType;
  updatedType?: SpotlightBlockType;
  deletedType?: SpotlightBlockType;
};

type SpotlightSectionProps = {
  blocks: SpotlightBlock[];
  reservedBlocks?: SpotlightBlock[];
  editable?: boolean;
  requestQuoteEdit?: boolean;
  onQuoteEditRequestHandled?: () => void;
};

function spotlightDisplayBlocks(blocks: SpotlightBlock[]): SpotlightBlock[] {
  return blocks.filter(
    (block) => block.type !== "quote" && block.type !== "passions",
  );
}

export function SpotlightSection({
  blocks: initialBlocks,
  reservedBlocks = [],
  editable = false,
  requestQuoteEdit = false,
  onQuoteEditRequestHandled,
}: SpotlightSectionProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [showPicker, setShowPicker] = useState(false);
  const [editingBlock, setEditingBlock] = useState<SpotlightBlock | null>(null);
  const [addingType, setAddingType] = useState<SpotlightBlockType | null>(null);
  const [error, setError] = useState("");
  const saveMutation = useSaveSpotlightMutation();
  const existingQuote = reservedBlocks.find((block) => block.type === "quote") ?? null;
  const existingBio = blocks.find((block) => block.type === "bio") ?? null;
  const excludedPickerTypes: SpotlightBlockType[] = [
    "passions",
    ...(existingBio ? (["bio"] as const) : []),
    ...(existingQuote ? (["quote"] as const) : []),
  ];

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  useEffect(() => {
    if (!requestQuoteEdit || !existingQuote) {
      return;
    }

    setEditingBlock(existingQuote);
    onQuoteEditRequestHandled?.();
  }, [existingQuote, onQuoteEditRequestHandled, requestQuoteEdit]);

  if (!editable && blocks.length === 0) {
    return null;
  }

  function mergeAllBlocks(nextSpotlightBlocks: SpotlightBlock[]): SpotlightBlock[] {
    const quoteFromSpotlight = nextSpotlightBlocks.find(
      (block) => block.type === "quote",
    );
    const quoteFromReserved = reservedBlocks.find((block) => block.type === "quote");
    const quote = quoteFromSpotlight ?? quoteFromReserved;

    const passions = nextSpotlightBlocks.some((block) => block.type === "passions")
      ? nextSpotlightBlocks.filter((block) => block.type === "passions")
      : reservedBlocks.filter((block) => block.type === "passions");

    const mainSpotlight = nextSpotlightBlocks.filter(
      (block) => block.type !== "quote" && block.type !== "passions",
    );

    return [...(quote ? [quote] : []), ...passions, ...mainSpotlight];
  }

  async function persistBlocks(
    nextSpotlightBlocks: SpotlightBlock[],
    options?: PersistSpotlightOptions,
  ) {
    const previousBlocks = blocks;
    setBlocks(spotlightDisplayBlocks(nextSpotlightBlocks));
    setError("");

    const result = await saveMutation.mutateAsync(
      mergeAllBlocks(nextSpotlightBlocks),
    );

    if (!result.success) {
      const message =
        result.error ?? "Failed to save spotlight blocks.";
      setError(message);
      setBlocks(previousBlocks);
      showSpotlightSaveErrorToast(message);
      return;
    }

    if (options?.addedType) {
      showSpotlightBlockAddedToast(options.addedType);
    } else if (options?.deletedType) {
      showSpotlightBlockDeletedToast(options.deletedType);
    } else if (options?.updatedType) {
      showSpotlightBlockUpdatedToast(options.updatedType);
    }
  }

  function saveBlock(block: SpotlightBlock) {
    const index = blocks.findIndex((entry) => entry.id === block.id);
    let nextBlocks: SpotlightBlock[];
    let isNew = index < 0;

    if (block.type === "bio") {
      const bioIndex = blocks.findIndex((entry) => entry.type === "bio");
      isNew = bioIndex < 0;

      nextBlocks =
        bioIndex >= 0
          ? blocks.map((entry, entryIndex) =>
              entryIndex === bioIndex ? block : entry,
            )
          : [...blocks, block];
    } else if (block.type === "quote") {
      isNew = !existingQuote;
      nextBlocks = [...blocks.filter((entry) => entry.type !== "quote"), block];
    } else {
      nextBlocks =
        index < 0
          ? [...blocks, block]
          : blocks.map((entry, entryIndex) =>
              entryIndex === index ? block : entry,
            );
    }

    void persistBlocks(
      nextBlocks,
      isNew ? { addedType: block.type } : { updatedType: block.type },
    );
  }

  function deleteBlock(id: string) {
    const removed = blocks.find((block) => block.id === id);
    void persistBlocks(
      blocks.filter((block) => block.id !== id),
      removed ? { deletedType: removed.type } : undefined,
    );
  }

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <h2 className="font-semibold text-gray-900">Personal Spotlight</h2>
          <span className="ml-1 text-xs text-gray-400">— Your story, your way</span>
        </div>
        {editable ? (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Block
          </button>
        ) : null}
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {blocks.length === 0 && editable ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Flame className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mb-1 font-medium text-gray-600">
              Make your profile unforgettable
            </p>
            <p className="mb-4 text-sm text-gray-400">
              Add a bio, achievement, code snippet, video intro, or personal quote.
            </p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Your First Block
            </button>
          </div>
        ) : null}

        {blocks.map((block) => (
          <div key={block.id} className="group relative">
            {editable ? (
              <div className="absolute top-1/2 -left-4 flex -translate-y-1/2 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-gray-300" aria-hidden="true" />
              </div>
            ) : null}

            <SpotlightBlockView block={block} />

            {editable ? (
              <div
                className={`absolute right-3 z-10 flex items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 ${
                  block.type === "code" ? "top-12" : "top-3"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setEditingBlock(block)}
                  disabled={saveMutation.isPending}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Edit spotlight block"
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  disabled={saveMutation.isPending}
                  className="rounded-lg border border-red-200 bg-white p-1.5 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50"
                  aria-label="Delete spotlight block"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <AddSpotlightBlockPicker
        open={showPicker}
        excludedTypes={excludedPickerTypes}
        onPick={(type) => {
          setShowPicker(false);
          setAddingType(type);
        }}
        onClose={() => setShowPicker(false)}
      />

      {addingType ? (
        <SpotlightBlockEditor
          open
          block={{ type: addingType }}
          onSave={saveBlock}
          onClose={() => setAddingType(null)}
        />
      ) : null}

      {editingBlock ? (
        <SpotlightBlockEditor
          open
          block={editingBlock}
          onSave={saveBlock}
          onClose={() => setEditingBlock(null)}
        />
      ) : null}
    </div>
  );
}
