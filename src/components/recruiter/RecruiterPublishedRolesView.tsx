"use client";

import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";

import { getCandidateJobPath } from "@/lib/auth/routes";
import type { RecruiterDirectoryActiveRole } from "@/lib/recruiter/recruiter-directory.types";

type RecruiterPublishedRolesViewProps = {
  roles: RecruiterDirectoryActiveRole[];
};

export function RecruiterPublishedRolesView({
  roles,
}: RecruiterPublishedRolesViewProps) {
  if (roles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
        <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <h3 className="mb-1 text-base font-semibold text-gray-900">
          No open roles right now
        </h3>
        <p className="text-sm text-gray-500">
          This recruiter is not actively hiring at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Active Job Postings</h2>
      <div className="space-y-3">
        {roles.map((role) => (
          <Link
            key={role.id}
            href={getCandidateJobPath(role.id)}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-sm sm:p-5"
          >
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                {role.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                <span className="font-medium text-blue-600">{role.type}</span>
                <span>{role.location}</span>
                <span className="font-medium text-gray-700">{role.salary}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
