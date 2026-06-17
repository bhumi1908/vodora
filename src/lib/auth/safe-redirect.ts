import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAccountType } from "@/lib/auth/account-type";
import { getPostLoginRedirect } from "@/lib/auth/post-login-redirect";
import {
  isCandidateOnlyRoute,
  isGuestOnlyRoute,
  isProtectedRoute,
  isRecruiterOnlyRoute,
} from "@/lib/auth/route-protection";
import {
  CANDIDATE_WELCOME_PATH,
  getDashboardPath,
  RECRUITER_WELCOME_PATH,
} from "@/lib/auth/routes";

function isWelcomePath(pathname: string): boolean {
  return (
    pathname === CANDIDATE_WELCOME_PATH ||
    pathname === RECRUITER_WELCOME_PATH ||
    pathname.startsWith(`${CANDIDATE_WELCOME_PATH}/`) ||
    pathname.startsWith(`${RECRUITER_WELCOME_PATH}/`)
  );
}

export function parseSafeRedirectPath(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return null;
  }

  const pathname = trimmed.split("?")[0]?.split("#")[0];

  if (!pathname) {
    return null;
  }

  if (isGuestOnlyRoute(pathname)) {
    return null;
  }

  if (!isProtectedRoute(pathname) && !isWelcomePath(pathname)) {
    return null;
  }

  return pathname;
}

export function isRedirectAllowedForAccountType(
  pathname: string,
  accountType: "candidate" | "recruiter",
): boolean {
  if (isRecruiterOnlyRoute(pathname) && accountType !== "recruiter") {
    return false;
  }

  if (isCandidateOnlyRoute(pathname) && accountType !== "candidate") {
    return false;
  }

  return true;
}

export async function resolvePostLoginRedirect(
  supabase: SupabaseClient,
  user: User,
  requestedRedirect?: string | null,
): Promise<string> {
  const accountType = await getAccountType(supabase, user);
  const defaultRedirect = await getPostLoginRedirect(supabase, user);
  const safePath = parseSafeRedirectPath(requestedRedirect);

  if (!safePath) {
    return defaultRedirect;
  }

  if (!isRedirectAllowedForAccountType(safePath, accountType)) {
    return getDashboardPath(accountType);
  }

  return safePath;
}
