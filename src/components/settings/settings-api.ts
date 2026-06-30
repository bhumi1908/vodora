import type { CandidateVisibility } from "@/lib/settings/candidate-visibility";
import type { CandidateSettingsData } from "@/lib/settings/fetch-candidate-settings";

type ApiResult = {
  success: boolean;
  error?: string;
};

async function parseApiResult(response: Response): Promise<ApiResult> {
  const data = (await response.json()) as ApiResult;

  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.error ?? "Something went wrong. Please try again.",
    };
  }

  return { success: true };
}

export async function fetchCandidateSettings(): Promise<{
  success: boolean;
  settings?: CandidateSettingsData;
  error?: string;
}> {
  const response = await fetch("/api/profile/settings");
  const data = (await response.json()) as {
    success: boolean;
    settings?: CandidateSettingsData;
    error?: string;
  };

  if (!response.ok || !data.success || !data.settings) {
    return {
      success: false,
      error: data.error ?? "Could not load settings.",
    };
  }

  return {
    success: true,
    settings: data.settings,
  };
}

export async function saveCandidateVisibility(
  visibility: CandidateVisibility,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility }),
  });

  return parseApiResult(response);
}

export async function saveDefaultCoverLetter(
  defaultCoverLetter: string,
): Promise<ApiResult> {
  const response = await fetch("/api/profile/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ defaultCoverLetter }),
  });

  return parseApiResult(response);
}

export async function fetchRememberMePreference(): Promise<{
  success: boolean;
  rememberMe?: boolean;
  error?: string;
}> {
  const response = await fetch("/api/auth/remember-me");
  const data = (await response.json()) as {
    success: boolean;
    rememberMe?: boolean;
    error?: string;
  };

  if (!response.ok || !data.success || data.rememberMe === undefined) {
    return {
      success: false,
      error: data.error ?? "Could not load sign-in preference.",
    };
  }

  return {
    success: true,
    rememberMe: data.rememberMe,
  };
}

export async function saveRememberMePreference(
  rememberMe: boolean,
): Promise<ApiResult> {
  const response = await fetch("/api/auth/remember-me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rememberMe }),
  });

  return parseApiResult(response);
}
