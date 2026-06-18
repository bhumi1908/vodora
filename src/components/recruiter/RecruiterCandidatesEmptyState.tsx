type RecruiterCandidatesEmptyStateProps = {
  candidatesError?: string | null;
};

function isMissingRpcError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("get_recruiter_dashboard_candidates") ||
    normalized.includes("search_recruiter_candidates") ||
    normalized.includes("get_recruiter_search_metadata") ||
    normalized.includes("could not find the function") ||
    normalized.includes("schema cache")
  );
}

export function RecruiterCandidatesEmptyState({
  candidatesError,
}: RecruiterCandidatesEmptyStateProps) {
  if (candidatesError && isMissingRpcError(candidatesError)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-sm font-medium text-amber-900">
          Database setup required
        </p>
        <p className="mt-2 text-sm text-amber-800">
          Apply the Supabase migrations{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
            20250618000000_search_recruiter_candidates.sql
          </code>{" "}
          in your Supabase project, then refresh this page.
        </p>
      </div>
    );
  }

  if (candidatesError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-900">
          Could not load candidates
        </p>
        <p className="mt-2 text-sm text-red-700">{candidatesError}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <p className="text-sm font-medium text-gray-900">
        No candidates available yet
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Candidates appear here when their profile visibility is set to
        recruiters only or public. No connection request is needed — apply the
        Supabase migrations or update candidate visibility in the database.
      </p>
    </div>
  );
}
