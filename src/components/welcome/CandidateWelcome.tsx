"use client";

import {
  Award,
  Briefcase,
  CheckCircle,
  Circle,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { CandidateProfileEditData } from "@/components/profile/edit/types";
import { RequestReferenceModal } from "@/components/profile/reference/RequestReferenceModal";
import {
  WelcomeTaskModal,
  type WelcomeProfileTaskId,
} from "@/components/welcome/WelcomeTaskModal";
import { CANDIDATE_DASHBOARD_PATH } from "@/lib/auth/routes";
import { useCandidateReferencesQuery } from "@/lib/query/use-reference-queries";

type CandidateWelcomeProps = {
  profile: CandidateProfileEditData;
};

const tasks = [
  { id: "photo", icon: Upload, label: "Upload Photo" },
  { id: "experience", icon: Briefcase, label: "Add Employment History" },
  { id: "skills", icon: Award, label: "Add Skills" },
  { id: "documents", icon: Upload, label: "Upload Resume or Documents" },
  { id: "references", icon: Users, label: "Request First Reference" },
] as const;

type WelcomeTaskId = (typeof tasks)[number]["id"];

function calculateProgress(
  profile: CandidateProfileEditData,
  referenceRequested: boolean,
): number {
  const checks = [
    Boolean(profile.profilePictureUrl),
    profile.experience.length > 0,
    profile.skills.length > 0,
    profile.documents.some((document) => document.type === "resume"),
    referenceRequested,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function isTaskComplete(
  taskId: WelcomeTaskId,
  profile: CandidateProfileEditData,
  referenceRequested: boolean,
): boolean {
  switch (taskId) {
    case "photo":
      return Boolean(profile.profilePictureUrl);
    case "experience":
      return profile.experience.length > 0;
    case "skills":
      return profile.skills.length > 0;
    case "documents":
      return profile.documents.some((document) => document.type === "resume");
    case "references":
      return referenceRequested;
    default:
      return false;
  }
}

export function CandidateWelcome({ profile }: CandidateWelcomeProps) {
  const router = useRouter();
  const [activeProfileTask, setActiveProfileTask] =
    useState<WelcomeProfileTaskId | null>(null);
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);
  const { data: references = [] } = useCandidateReferencesQuery();
  const referenceRequested = references.length > 0;

  const employmentHistoryOptions = useMemo(
    () =>
      profile.experience
        .filter((entry): entry is typeof entry & { id: string } =>
          Boolean(entry.id),
        )
        .map((entry) => ({
          id: entry.id,
          label: `${entry.title} at ${entry.company}`,
        })),
    [profile.experience],
  );

  const progress = useMemo(
    () => calculateProgress(profile, referenceRequested),
    [profile, referenceRequested],
  );

  function goToDashboard() {
    router.push(CANDIDATE_DASHBOARD_PATH);
  }

  function openTask(taskId: WelcomeTaskId) {
    if (taskId === "references") {
      setReferenceModalOpen(true);
      return;
    }

    setActiveProfileTask(taskId);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">Vodora</span>
          </Link>
          <h1 className="mb-3 text-4xl font-semibold text-gray-900">
            Welcome to Vodora!
          </h1>
          <p className="text-xl text-gray-600">
            Let&apos;s complete your professional profile
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Profile Progress
              </span>
              <span className="text-sm font-medium text-blue-600">
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Complete Your Profile
          </h2>

          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = task.icon;
              const completed = isTaskComplete(
                task.id,
                profile,
                referenceRequested,
              );

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => openTask(task.id)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 p-4 text-left transition-colors hover:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-center gap-3">
                    {completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {task.label}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {completed ? "Edit" : "Start"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={CANDIDATE_DASHBOARD_PATH}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-center text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={goToDashboard}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 text-base font-medium text-gray-700 transition-colors hover:border-gray-400"
            >
              Skip for Now
            </button>
          </div>
        </div>

        <WelcomeTaskModal
          taskId={activeProfileTask}
          initialProfile={profile}
          onClose={() => setActiveProfileTask(null)}
        />

        <RequestReferenceModal
          open={referenceModalOpen}
          onClose={() => setReferenceModalOpen(false)}
          employmentHistoryOptions={employmentHistoryOptions}
        />
      </div>
    </div>
  );
}
