import { NextResponse } from "next/server";

import { fetchReferenceCollectionCandidateDetails } from "@/lib/recruiter/fetch-reference-collection-candidates";
import { requireOwnRecruiter } from "@/lib/recruiter/require-own-recruiter";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ candidateId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { candidateId } = await context.params;
  const { searchParams } = new URL(request.url);
  const vodoraId = searchParams.get("vodoraId") ?? undefined;
  const supabase = await createClient();
  const recruiterContext = await requireOwnRecruiter(supabase);

  if (!recruiterContext) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  const result = await fetchReferenceCollectionCandidateDetails(
    supabase,
    candidateId,
    { vodoraId },
  );

  if (!result.candidate) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Candidate not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    candidate: result.candidate,
  });
}
