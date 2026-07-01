"use client";

import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CustomSelect } from "@/components/shared/SelectField";

import {
  SPOTLIGHT_BLOCK_TYPES,
  SPOTLIGHT_CODE_LANGUAGES,
} from "@/components/profile/spotlight/constants";
import { Modal } from "@/components/ui/Modal";
import { createSpotlightBlockId, SPOTLIGHT_LIMITS } from "@/lib/profile/spotlight";
import type { SpotlightBlock, SpotlightBlockType } from "@/lib/profile/spotlight.types";

type SpotlightBlockEditorProps = {
  open: boolean;
  block: Partial<SpotlightBlock> & { type: SpotlightBlockType };
  onSave: (block: SpotlightBlock) => void;
  onClose: () => void;
};

function isBlockValid(block: SpotlightBlock): boolean {
  switch (block.type) {
    case "bio":
      return (block.text ?? "").trim().length > 5;
    case "quote": {
      const quoteText = (block.text ?? "").trim();
      return (
        quoteText.length > 5 &&
        quoteText.length <= SPOTLIGHT_LIMITS.maxQuoteLength
      );
    }
    case "achievement":
      return (
        (block.title ?? "").trim().length > 2 &&
        (block.text ?? "").trim().length > 5
      );
    case "code":
      return (block.code ?? "").trim().length > 2;
    case "video":
      return (block.videoUrl ?? "").trim().length > 5;
    case "passions":
      return (block.tags ?? []).length > 0;
    default:
      return false;
  }
}

export function SpotlightBlockEditor({
  open,
  block,
  onSave,
  onClose,
}: SpotlightBlockEditorProps) {
  const [data, setData] = useState<SpotlightBlock>(() => ({
    id: block.id ?? createSpotlightBlockId(),
    type: block.type,
    text: block.text ?? "",
    title: block.title ?? "",
    code: block.code ?? "// Your code here\n",
    language: block.language ?? "JavaScript",
    videoUrl: block.videoUrl ?? "",
    videoTitle: block.videoTitle ?? "",
    tags: block.tags ?? [],
  }));
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setData({
      id: block.id ?? createSpotlightBlockId(),
      type: block.type,
      text: block.text ?? "",
      title: block.title ?? "",
      code: block.code ?? "// Your code here\n",
      language: block.language ?? "JavaScript",
      videoUrl: block.videoUrl ?? "",
      videoTitle: block.videoTitle ?? "",
      tags: block.tags ?? [],
    });
    setTagInput("");
  }, [block, open]);

  const typeInfo = useMemo(
    () => SPOTLIGHT_BLOCK_TYPES.find((entry) => entry.id === data.type)!,
    [data.type],
  );
  const Icon = typeInfo.icon;
  const canSave = isBlockValid(data);

  function addTag() {
    const nextTag = tagInput.trim();

    if (nextTag && !data.tags?.includes(nextTag)) {
      setData((current) => ({
        ...current,
        tags: [...(current.tags ?? []), nextTag],
      }));
    }

    setTagInput("");
  }

  function removeTag(tag: string) {
    setData((current) => ({
      ...current,
      tags: (current.tags ?? []).filter((entry) => entry !== tag),
    }));
  }

  function handleSave() {
    if (!canSave) {
      return;
    }

    onSave(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={typeInfo.label}
      maxWidthClassName="max-w-xl"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            Save Block
          </button>
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${typeInfo.color}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm text-gray-500">{typeInfo.desc}</p>
      </div>

      <div className="space-y-4">
        {data.type === "bio" ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Your story
            </label>
            <textarea
              rows={6}
              autoFocus
              value={data.text}
              onChange={(event) =>
                setData((current) => ({ ...current, text: event.target.value }))
              }
              placeholder="Write a short bio — who you are, what drives you, what you're looking for..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        ) : null}

        {data.type === "achievement" ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Achievement title
              </label>
              <input
                autoFocus
                type="text"
                value={data.title}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Led migration of 40TB database with zero downtime"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Tell the story
              </label>
              <textarea
                rows={4}
                value={data.text}
                onChange={(event) =>
                  setData((current) => ({ ...current, text: event.target.value }))
                }
                placeholder="What was the challenge, what did you do, and what was the impact?"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </>
        ) : null}

        {data.type === "quote" ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Your quote or motto
            </label>
            <textarea
              rows={3}
              autoFocus
              maxLength={SPOTLIGHT_LIMITS.maxQuoteLength}
              value={data.text}
              onChange={(event) =>
                setData((current) => ({ ...current, text: event.target.value }))
              }
              placeholder="A short belief or phrase — shown in your profile header banner."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="mt-1.5 text-right text-xs text-gray-400">
              {(data.text ?? "").length}/{SPOTLIGHT_LIMITS.maxQuoteLength} characters
            </p>
          </div>
        ) : null}

        {data.type === "passions" ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Add your interests
            </label>
            <div className="mb-3 flex gap-2">
              <input
                autoFocus
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g. Open source, Rock climbing, AI research..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-rose-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {data.type === "code" ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Language
              </label>
              <CustomSelect
                value={data.language ?? "JavaScript"}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    language: event.target.value,
                  }))
                }
                options={SPOTLIGHT_CODE_LANGUAGES.map((language) => ({
                  value: language,
                  label: language,
                }))}
                allowEmpty={false}
                size="comfortable"
                rounded="xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Code
              </label>
              <textarea
                autoFocus
                rows={10}
                value={data.code}
                onChange={(event) =>
                  setData((current) => ({ ...current, code: event.target.value }))
                }
                spellCheck={false}
                className="w-full resize-none rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 font-mono text-sm leading-relaxed text-green-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </>
        ) : null}

        {data.type === "video" ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Video title
              </label>
              <input
                autoFocus
                type="text"
                value={data.videoTitle}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    videoTitle: event.target.value,
                  }))
                }
                placeholder="e.g. My 60-second introduction"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                YouTube or Vimeo URL
              </label>
              <input
                type="url"
                value={data.videoUrl}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    videoUrl: event.target.value,
                  }))
                }
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Supports YouTube and Vimeo links
              </p>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
