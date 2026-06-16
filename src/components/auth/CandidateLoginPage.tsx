"use client";

import { Briefcase, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { CandidateBrandPanel } from "@/components/auth/CandidateBrandPanel";
import { AuthDivider } from "@/components/auth/shared/AuthDivider";
import { AuthInput } from "@/components/auth/shared/AuthInput";
import {
  GoogleLoginButton,
  LinkedInLoginButton,
  MicrosoftLoginButton,
} from "@/components/auth/shared/SocialLoginButton";

export function CandidateLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex min-h-screen">
      <CandidateBrandPanel />

      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-600">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-semibold text-gray-900">
                  Vodora
                </span>
                <span className="text-[10px] font-medium tracking-wide text-blue-600 uppercase">
                  For Candidates
                </span>
              </div>
            </Link>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Sign in to your Vodora candidate account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput
              id="email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={<Mail className="h-5 w-5" />}
            />

            <AuthInput
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <AuthDivider />

            <div className="mt-6 space-y-3">
              <LinkedInLoginButton />
              <GoogleLoginButton />
              <MicrosoftLoginButton />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
