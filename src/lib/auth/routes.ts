export const CANDIDATE_WELCOME_PATH = "/welcome/candidate";
export const RECRUITER_WELCOME_PATH = "/welcome/recruiter";

export const CANDIDATE_DASHBOARD_PATH = "/dashboard";
export const CANDIDATE_JOBS_PATH = "/jobs";
export const CANDIDATE_FIND_RECRUITERS_PATH = "/find-recruiters";
export const CANDIDATE_FIND_CANDIDATES_PATH = "/find-candidates";
export const CANDIDATE_CONNECTIONS_PATH = "/connections";

export function getCandidateJobPath(jobId: string): string {
  return `${CANDIDATE_JOBS_PATH}?job=${encodeURIComponent(jobId)}`;
}
export const RECRUITER_DASHBOARD_PATH = "/recruiter/dashboard";
export const RECRUITER_SEARCH_PATH = "/recruiter/search";
export const RECRUITER_SAVED_PATH = "/recruiter/saved";
export const RECRUITER_CONNECTIONS_PATH = "/recruiter/connections";
export const RECRUITER_PROFILE_PATH = "/recruiter/profile";
export const RECRUITER_PROFILE_ROLES_PATH = "/recruiter/profile?tab=roles";
export const RECRUITER_PROFILE_EDIT_PATH = "/recruiter/profile/edit";

export function isRecruiterAppRoute(pathname: string): boolean {
  return pathname === "/recruiter" || pathname.startsWith("/recruiter/");
}

export function getRecruiterCandidateProfilePath(vodoraId: string): string {
  return `/recruiter/candidates/${encodeURIComponent(vodoraId)}`;
}

export function getReferenceSharePath(shareToken: string): string {
  return `/share/${encodeURIComponent(shareToken)}`;
}

export function getWelcomePath(accountType: "candidate" | "recruiter"): string {
  return accountType === "recruiter"
    ? RECRUITER_WELCOME_PATH
    : CANDIDATE_WELCOME_PATH;
}

export function getDashboardPath(accountType: "candidate" | "recruiter"): string {
  return accountType === "recruiter"
    ? RECRUITER_DASHBOARD_PATH
    : CANDIDATE_DASHBOARD_PATH;
}
