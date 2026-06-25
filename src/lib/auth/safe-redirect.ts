import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getAccountType } from "@/lib/auth/account-type";
import {
  getPostLoginRedirect,
  type PostLoginContext,
} from "@/lib/auth/post-login-redirect";
import {
  isCandidateOnlyRoute,
  isGuestOnlyRoute,
  isProtectedRoute,
  isRecruiterOnlyRoute,
  isReferenceRoute,
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

function isAllowedRedirectPathname(pathname: string): boolean {
  return (
    isProtectedRoute(pathname) ||
    isWelcomePath(pathname) ||
    isReferenceRoute(pathname)
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

  const pathWithSearch = trimmed.split("#")[0];

  if (!pathWithSearch) {
    return null;
  }

  const pathname = pathWithSearch.split("?")[0];

  if (!pathname) {
    return null;
  }

  if (isGuestOnlyRoute(pathname)) {
    return null;
  }

  if (!isAllowedRedirectPathname(pathname)) {
    return null;
  }

  return pathWithSearch;
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
  context?: Partial<PostLoginContext>,
): Promise<string> {
  const accountType =
    context?.accountType ?? (await getAccountType(supabase, user));
  const defaultRedirect = await getPostLoginRedirect(supabase, user, {
    ...context,
    accountType,
  });
  const safePath = parseSafeRedirectPath(requestedRedirect);

  if (!safePath) {
    return defaultRedirect;
  }

  const redirectPathname = safePath.split("?")[0] ?? safePath;

  if (!isRedirectAllowedForAccountType(redirectPathname, accountType)) {
    return getDashboardPath(accountType);
  }

  return safePath;
}
