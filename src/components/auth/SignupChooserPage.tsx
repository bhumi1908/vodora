"use client";

import { Building2, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import {
  SignupHeader,
  SignupRoleCard,
} from "@/components/auth/shared/SignupLayout";

const candidateFeatures = [
  "Verified References",
  "Employment Verification",
  "Endorsements",
  "Professional Reputation",
  "Job Opportunities",
];

const recruiterFeatures = [
  "Candidate Search",
  "Reference Verification",
  "Job Advertising",
  "Talent Pipeline",
  "Recruiter Dashboard",
];

function SignupChooserContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "recruiter") {
      router.replace("/signup/recruiter");
    } else if (type === "candidate") {
      router.replace("/signup/candidate");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <SignupHeader variant="chooser" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SignupRoleCard
            icon={User}
            title="Candidate"
            description="Build your trusted professional profile."
            features={candidateFeatures}
            buttonText="Join as Candidate"
            href="/signup/candidate"
          />
          <SignupRoleCard
            icon={Building2}
            title="Recruiter"
            description="Find trusted candidates and hire faster."
            features={recruiterFeatures}
            buttonText="Join as Recruiter"
            href="/signup/recruiter"
          />
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupChooserFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-pulse rounded-full bg-blue-200" />
    </div>
  );
}

export function SignupChooserPage() {
  return (
    <Suspense fallback={<SignupChooserFallback />}>
      <SignupChooserContent />
    </Suspense>
  );
}
