"use client";

import { Users } from "lucide-react";

import { ConnectionAvatar } from "@/components/connections/ConnectionAvatar";

type ConnectionSuggestionCardProps = {
  name: string;
  initials: string;
  subtitle: string;
  profilePictureUrl?: string | null;
  mutualConnections?: number | null;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
};

export function ConnectionSuggestionCard({
  name,
  initials,
  subtitle,
  profilePictureUrl,
  mutualConnections,
  actionLabel = "Request",
  actionDisabled = false,
  onAction,
}: ConnectionSuggestionCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white text-center shadow-sm">
      <div className="h-16 bg-gradient-to-r from-sky-200 to-blue-300" />
      <div className="-mt-8 flex justify-center">
        <div className="rounded-full border-4 border-white">
          <ConnectionAvatar
            name={name}
            initials={initials}
            profilePictureUrl={profilePictureUrl}
            size="lg"
          />
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <h3 className="truncate font-semibold text-gray-900">{name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
          {subtitle}
        </p>
        {mutualConnections && mutualConnections > 0 ? (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {mutualConnections} mutual connection
            {mutualConnections === 1 ? "" : "s"}
          </p>
        ) : null}
        <button
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
          className="mt-4 w-full rounded-full border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
