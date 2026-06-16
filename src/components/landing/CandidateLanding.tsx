"use client";

import {
  Building2,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { featuredCandidates } from "@/components/landing/featuredCandidates";
import { InviteModal } from "@/components/landing/InviteModal";

export function CandidateLanding() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Vodora
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-4"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Candidates
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              Browse verified professionals and their trusted references
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100 sm:w-auto"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span className="text-center">Invite Colleagues & Connect</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {featuredCandidates.map((candidate) => (
            <article
              key={candidate.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600" />
              <div className="-mt-8 px-4 pb-4">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gray-200">
                  <span className="text-xl font-semibold text-gray-700">
                    {candidate.avatar}
                  </span>
                </div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  {candidate.name}
                </h3>
                <p className="mb-3 text-sm text-gray-600">{candidate.title}</p>
                <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{candidate.company}</span>
                </div>
                <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{candidate.location}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>{candidate.references} References</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {showInvite ? <InviteModal onClose={() => setShowInvite(false)} /> : null}
    </div>
  );
}
