"use client";

import {
  Award,
  Briefcase,
  Building2,
  CheckCircle,
  Circle,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";
import type { RecruiterProfileEditData } from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import {
  isRecruiterCompanyProfileComplete,
  isRecruiterHiringPreferencesComplete,
} from "@/lib/recruiter/transform-own-recruiter-profile-to-edit";
import {
  RecruiterWelcomeTaskModal,
  type RecruiterWelcomeTaskId,
} from "@/components/welcome/RecruiterWelcomeTaskModal";
import { RECRUITER_DASHBOARD_PATH } from "@/lib/auth/routes";

type RecruiterWelcomeProps = {
  profile: RecruiterProfileEditData;
  emailVerified: boolean;
  invitations: CompanyInvitationRecord[];
};

const interactiveTasks = [
  { id: "company", icon: Building2, label: "Add Company Profile" },
  { id: "preferences", icon: Award, label: "Set Hiring Preferences" },
  { id: "invite", icon: Users, label: "Invite Team Members" },
] as const;

type InteractiveTaskId = (typeof interactiveTasks)[number]["id"];

function calculateProgress(
  profile: RecruiterProfileEditData,
  emailVerified: boolean,
  invitations: CompanyInvitationRecord[],
): number {
  const checks = [
    emailVerified,
    isRecruiterCompanyProfileComplete(profile),
    isRecruiterHiringPreferencesComplete(profile),
    invitations.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function isTaskComplete(
  taskId: InteractiveTaskId | "email" | "job",
  profile: RecruiterProfileEditData,
  emailVerified: boolean,
  invitations: CompanyInvitationRecord[],
): boolean {
  switch (taskId) {
    case "email":
      return emailVerified;
    case "company":
      return isRecruiterCompanyProfileComplete(profile);
    case "preferences":
      return isRecruiterHiringPreferencesComplete(profile);
    case "invite":
      return invitations.length > 0;
    case "job":
      return false;
    default:
      return false;
  }
}

export function RecruiterWelcome({
  profile,
  emailVerified,
  invitations: initialInvitations,
}: RecruiterWelcomeProps) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<RecruiterWelcomeTaskId | null>(
    null,
  );
  const [invitations, setInvitations] = useState(initialInvitations);

  useEffect(() => {
    setInvitations(initialInvitations);
  }, [initialInvitations]);

  const progress = useMemo(
    () => calculateProgress(profile, emailVerified, invitations),
    [profile, emailVerified, invitations],
  );

  function goToDashboard() {
    router.push(RECRUITER_DASHBOARD_PATH);
  }

  function openTask(taskId: InteractiveTaskId) {
    setActiveTask(taskId);
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
            Let&apos;s set up your recruiter account
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Setup Progress
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

          {!emailVerified ? (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Verification in progress:</span>{" "}
                We&apos;re verifying your company details. This typically takes
                1-2 business days. You&apos;ll receive an email once approved.
              </p>
            </div>
          ) : null}

          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Complete Your Setup
          </h2>

          <div className="space-y-3">
            <div className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4">
              <div className="flex items-center gap-3">
                {isTaskComplete("email", profile, emailVerified, invitations) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Verify Company Email
                </span>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {emailVerified ? "Complete" : "Pending"}
              </span>
            </div>

            {interactiveTasks.map((task) => {
              const Icon = task.icon;
              const completed = isTaskComplete(
                task.id,
                profile,
                emailVerified,
                invitations,
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

            <div className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 opacity-70">
              <div className="flex items-center gap-3">
                <Circle className="h-5 w-5 text-gray-400" />
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Create First Job
                </span>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Coming soon
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={RECRUITER_DASHBOARD_PATH}
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

        <RecruiterWelcomeTaskModal
          taskId={activeTask}
          initialProfile={profile}
          initialInvitations={invitations}
          onClose={() => setActiveTask(null)}
          onSaved={() => router.refresh()}
          onInvitationCreated={(invitation) => {
            setInvitations((current) => [invitation, ...current]);
          }}
        />
      </div>
    </div>
  );
}
