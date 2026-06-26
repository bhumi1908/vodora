"use client";

import { useState } from "react";
import { Check, Flame, Play, Quote, Trophy } from "lucide-react";

import type { SpotlightBlock } from "@/lib/profile/spotlight.types";

type BlockViewProps = {
  block: SpotlightBlock;
};

export function BioBlockView({ block }: BlockViewProps) {
  return (
    <div className="relative min-w-0 pr-14 sm:pr-16">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
        Bio / Introduction
      </h3>
      <p className="text-base leading-relaxed break-words text-gray-700">
        {block.text}
      </p>
    </div>
  );
}

export function AchievementBlockView({ block }: BlockViewProps) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
        My Standout Achievement
      </h3>
      <div className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 pr-14 sm:p-6 sm:pr-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 sm:h-12 sm:w-12">
            <Trophy className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 text-base font-semibold break-words text-gray-900 sm:text-lg">
              {block.title}
            </h4>
            <p className="leading-relaxed break-words text-gray-600">
              {block.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuoteBlockView({ block }: BlockViewProps) {
  return (
    <div className="relative min-w-0 border-l-4 border-purple-400 py-2 pr-14 pl-6 sm:pr-16">
      <Quote className="mb-2 h-8 w-8 text-purple-200" />
      <p className="text-lg leading-relaxed font-medium break-words text-gray-800 italic sm:text-xl">
        &ldquo;{block.text}&rdquo;
      </p>
    </div>
  );
}

export function PassionsBlockView({ block }: BlockViewProps) {
  return (
    <div className="relative min-w-0 pr-14 sm:pr-16">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-rose-500" />
        <span className="text-sm font-semibold text-gray-700">
          Passions & Interests
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(block.tags ?? []).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CodeBlockView({ block }: BlockViewProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(block.code ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 font-mono text-xs text-gray-400">
            {block.language ?? "JavaScript"}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="text-xs text-gray-400 transition-colors hover:text-white"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Copied
            </span>
          ) : (
            "Copy"
          )}
        </button>
      </div>
      <div className="overflow-x-auto bg-gray-950 px-5 py-5">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre text-green-300">
          {block.code}
        </pre>
      </div>
    </div>
  );
}

export function VideoBlockView({ block }: BlockViewProps) {
  const [playing, setPlaying] = useState(false);

  function getEmbedUrl(url: string) {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return null;
  }

  const embedUrl = block.videoUrl ? getEmbedUrl(block.videoUrl) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200">
      {playing && embedUrl ? (
        <iframe
          src={embedUrl}
          title={block.videoTitle || "Video introduction"}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
          onClick={() => embedUrl && setPlaying(true)}
          disabled={!embedUrl}
        >
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30">
            <Play className="ml-1 h-7 w-7 text-white" />
          </div>
          <p className="font-medium text-white">
            {block.videoTitle || "Video Introduction"}
          </p>
          {!embedUrl && block.videoUrl ? (
            <p className="mt-1 text-xs text-gray-400">Unsupported URL format</p>
          ) : null}
        </button>
      )}
    </div>
  );
}

export function SpotlightBlockView({ block }: BlockViewProps) {
  switch (block.type) {
    case "bio":
      return <BioBlockView block={block} />;
    case "achievement":
      return <AchievementBlockView block={block} />;
    case "quote":
      return <QuoteBlockView block={block} />;
    case "passions":
      return <PassionsBlockView block={block} />;
    case "code":
      return <CodeBlockView block={block} />;
    case "video":
      return <VideoBlockView block={block} />;
    default:
      return null;
  }
}
