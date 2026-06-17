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

import { RECRUITER_DASHBOARD_PATH } from "@/lib/auth/routes";

const tasks = [
  { icon: CheckCircle, label: "Verify Company Email", completed: true },
  { icon: Building2, label: "Add Company Profile", completed: false },
  { icon: FileText, label: "Create First Job", completed: false },
  { icon: Award, label: "Set Hiring Preferences", completed: false },
  { icon: Users, label: "Invite Team Members", completed: false },
];

export function RecruiterWelcome() {
  const router = useRouter();

  function goToDashboard() {
    router.push(RECRUITER_DASHBOARD_PATH);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">Vodora</span>
          </Link>
          <h1 className="mb-3 text-4xl font-semibold text-gray-900">
            Welcome to Vodora! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Let&apos;s set up your recruiter account
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Setup Progress
              </span>
              <span className="text-sm font-medium text-blue-600">25%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: "25%" }}
              />
            </div>
          </div>

          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Complete Company Verification
          </h2>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Verification in progress:</span>{" "}
              We&apos;re verifying your company details. This typically takes
              1-2 business days. You&apos;ll receive an email once approved.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            {tasks.map((task) => {
              const Icon = task.icon;

              return (
                <div
                  key={task.label}
                  className="flex cursor-default items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500"
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {task.label}
                    </span>
                  </div>
                  {!task.completed ? (
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Start
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
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
      </div>
    </div>
  );
}
