import type { CandidateDashboardData } from "@/lib/candidate/dashboard.types";

type ApiSuccess<T> = {
  success: boolean;
  error?: string;
} & T;

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function fetchCandidateDashboardData(): Promise<CandidateDashboardData> {
  const response = await fetch("/api/candidate/dashboard");
  const payload = await parseJson<
    CandidateDashboardData & ApiSuccess<CandidateDashboardData>
  >(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Could not load dashboard.");
  }

  return {
    context: payload.context,
    profileCompletionPercent: payload.profileCompletionPercent,
    profileCompletionItems: payload.profileCompletionItems,
    connectionCounts: payload.connectionCounts,
    applicationsCount: payload.applicationsCount,
    profileViewsCount: payload.profileViewsCount,
    recentApplications: payload.recentApplications,
    applicationsError: payload.applicationsError,
  };
}
