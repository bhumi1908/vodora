"use client";

import { Flame, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { SpotlightBlockEditor } from "@/components/profile/spotlight/SpotlightBlockEditor";
import { ProfileSection } from "@/components/profile/ProfileSection";
import {
  showSpotlightBlockAddedToast,
  showSpotlightBlockUpdatedToast,
  showSpotlightSaveErrorToast,
} from "@/lib/profile/spotlight-toast";
import type { SpotlightBlock } from "@/lib/profile/spotlight.types";
import { useSaveSpotlightMutation } from "@/lib/query/use-profile-mutations";

type ProfilePassionsSectionProps = {
  blocks: SpotlightBlock[];
  allBlocks: SpotlightBlock[];
  editable?: boolean;
};

export function ProfilePassionsSection({
  blocks,
  allBlocks,
  editable = false,
}: ProfilePassionsSectionProps) {
  const [passionsBlocks, setPassionsBlocks] = useState(blocks);
  const [editingBlock, setEditingBlock] = useState<SpotlightBlock | null>(null);
  const [addingPassions, setAddingPassions] = useState(false);
  const [error, setError] = useState("");
  const saveMutation = useSaveSpotlightMutation();

  useEffect(() => {
    setPassionsBlocks(blocks);
  }, [blocks]);

  const tags = passionsBlocks.flatMap((block) => block.tags ?? []);

  if (tags.length === 0 && !editable) {
    return null;
  }

  async function persistPassionsBlock(block: SpotlightBlock) {
    const withoutPassions = allBlocks.filter((entry) => entry.type !== "passions");
    const index = passionsBlocks.findIndex((entry) => entry.id === block.id);
    const nextPassions =
      index < 0
        ? [...passionsBlocks, block]
        : passionsBlocks.map((entry, entryIndex) =>
            entryIndex === index ? block : entry,
          );
    const nextBlocks = [...withoutPassions, ...nextPassions];

    setPassionsBlocks(nextPassions);
    setError("");

    const result = await saveMutation.mutateAsync(nextBlocks);

    if (!result.success) {
      const message = result.error ?? "Failed to save passions.";
      setError(message);
      setPassionsBlocks(blocks);
      showSpotlightSaveErrorToast(message);
      return;
    }

    if (index < 0) {
      showSpotlightBlockAddedToast("passions");
    } else {
      showSpotlightBlockUpdatedToast("passions");
    }
  }

  const sectionAction = editable ? (
    <button
      type="button"
      onClick={() => {
        if (passionsBlocks[0]) {
          setEditingBlock(passionsBlocks[0]);
        } else {
          setAddingPassions(true);
        }
      }}
      disabled={saveMutation.isPending}
      aria-label={
        passionsBlocks.length > 0
          ? "Edit passions and interests"
          : "Add passions and interests"
      }
      className="flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
    >
      {passionsBlocks.length > 0 ? (
        <>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" />
          Add
        </>
      )}
    </button>
  ) : null;

  return (
    <>
      <ProfileSection
        title="Passions & Interests"
        icon={Flame}
        action={sectionAction}
      >
        {error ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">
            Add passions and interests to help people get to know you beyond work.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </ProfileSection>

      {addingPassions ? (
        <SpotlightBlockEditor
          open
          block={{ type: "passions" }}
          onSave={(block) => {
            void persistPassionsBlock(block);
            setAddingPassions(false);
          }}
          onClose={() => setAddingPassions(false)}
        />
      ) : null}

      {editingBlock ? (
        <SpotlightBlockEditor
          open
          block={editingBlock}
          onSave={(block) => {
            void persistPassionsBlock(block);
            setEditingBlock(null);
          }}
          onClose={() => setEditingBlock(null)}
        />
      ) : null}
    </>
  );
}
