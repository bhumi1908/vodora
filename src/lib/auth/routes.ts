export const CANDIDATE_WELCOME_PATH = "/welcome/candidate";
export const RECRUITER_WELCOME_PATH = "/welcome/recruiter";

export const CANDIDATE_DASHBOARD_PATH = "/dashboard";
export const RECRUITER_DASHBOARD_PATH = "/search";

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
