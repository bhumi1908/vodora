"use client";

import { Plus } from "lucide-react";

type ConnectionsPageHeaderProps = {
  role: "candidate" | "recruiter";
  onInviteClick: () => void;
};

export function ConnectionsPageHeader({
  role,
  onInviteClick,
}: ConnectionsPageHeaderProps) {
  const inviteLabel =
    role === "recruiter" ? "Invite a candidate" : "Invite & Connect";

  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Connections
        </h1>
        <p className="mt-1 max-w-xl text-sm text-gray-500 sm:text-base">
          Manage incoming requests, track pending invites, and view your
          network.
        </p>
      </div>
      <button
        type="button"
        onClick={onInviteClick}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        {inviteLabel}
      </button>
    </div>
  );
}
