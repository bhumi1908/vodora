import {
  CANDIDATE_DASHBOARD_PATH,
  RECRUITER_DASHBOARD_PATH,
} from "@/lib/auth/routes";

export const ACCESS_DENIED_PARAM = "access_denied";

export const ACCESS_DENIED_RECRUITER_ONLY = "recruiter_only";
export const ACCESS_DENIED_CANDIDATE_ONLY = "candidate_only";

export type AccessDeniedReason =
  | typeof ACCESS_DENIED_RECRUITER_ONLY
  | typeof ACCESS_DENIED_CANDIDATE_ONLY;

export function isAccessDeniedReason(
  value: string | null,
): value is AccessDeniedReason {
  return (
    value === ACCESS_DENIED_RECRUITER_ONLY ||
    value === ACCESS_DENIED_CANDIDATE_ONLY
  );
}

export function getCandidateDashboardAccessDeniedRedirect(): string {
  const params = new URLSearchParams({
    [ACCESS_DENIED_PARAM]: ACCESS_DENIED_RECRUITER_ONLY,
  });
  return `${CANDIDATE_DASHBOARD_PATH}?${params.toString()}`;
}

export function getRecruiterDashboardAccessDeniedRedirect(): string {
  const params = new URLSearchParams({
    [ACCESS_DENIED_PARAM]: ACCESS_DENIED_CANDIDATE_ONLY,
  });
  return `${RECRUITER_DASHBOARD_PATH}?${params.toString()}`;
}
