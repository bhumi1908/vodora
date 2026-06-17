import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAccountType } from "@/lib/auth/account-type";
import {
  CANDIDATE_DASHBOARD_PATH,
  getDashboardPath,
  RECRUITER_DASHBOARD_PATH,
} from "@/lib/auth/routes";

const GUEST_ONLY_PREFIXES = ["/login", "/signup"];

const CANDIDATE_ONLY_PREFIXES = [
  "/dashboard",
  "/welcome/candidate",
  "/marketplace",
  "/my-profile",
  "/jobs",
];

const RECRUITER_ONLY_PREFIXES = ["/recruiter", "/welcome/recruiter"];

const PROTECTED_PREFIXES = [
  ...CANDIDATE_ONLY_PREFIXES,
  ...RECRUITER_ONLY_PREFIXES,
  "/settings",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isGuestOnlyRoute(pathname: string): boolean {
  return matchesPrefix(pathname, GUEST_ONLY_PREFIXES);
}

export function isProtectedRoute(pathname: string): boolean {
  return matchesPrefix(pathname, PROTECTED_PREFIXES);
}

export function isCandidateOnlyRoute(pathname: string): boolean {
  return matchesPrefix(pathname, CANDIDATE_ONLY_PREFIXES);
}

export function isRecruiterOnlyRoute(pathname: string): boolean {
  return matchesPrefix(pathname, RECRUITER_ONLY_PREFIXES);
}

export function getLoginRedirect(pathname: string): string {
  const params = new URLSearchParams({ redirect: pathname });
  return `/login?${params.toString()}`;
}

export async function getRouteProtectionRedirect(
  supabase: SupabaseClient,
  user: User | null,
  pathname: string,
): Promise<string | null> {
  if (user && isGuestOnlyRoute(pathname)) {
    const accountType = await getAccountType(supabase, user);
    return getDashboardPath(accountType);
  }

  if (!user && isProtectedRoute(pathname)) {
    return getLoginRedirect(pathname);
  }

  if (user && isCandidateOnlyRoute(pathname)) {
    const accountType = await getAccountType(supabase, user);
    if (accountType === "recruiter") {
      return RECRUITER_DASHBOARD_PATH;
    }
  }

  if (user && isRecruiterOnlyRoute(pathname)) {
    const accountType = await getAccountType(supabase, user);
    if (accountType === "candidate") {
      return CANDIDATE_DASHBOARD_PATH;
    }
  }

  return null;
}
