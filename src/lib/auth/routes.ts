export const CANDIDATE_WELCOME_PATH = "/welcome/candidate";
export const RECRUITER_WELCOME_PATH = "/welcome/recruiter";

export const CANDIDATE_DASHBOARD_PATH = "/dashboard";
export const RECRUITER_DASHBOARD_PATH = "/recruiter/dashboard";
export const RECRUITER_SEARCH_PATH = "/recruiter/search";
export const RECRUITER_SAVED_PATH = "/recruiter/saved";

export function isRecruiterAppRoute(pathname: string): boolean {
  return pathname === "/recruiter" || pathname.startsWith("/recruiter/");
}

export function getRecruiterCandidateProfilePath(vodoraId: string): string {
  return `/recruiter/candidates/${encodeURIComponent(vodoraId)}`;
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
