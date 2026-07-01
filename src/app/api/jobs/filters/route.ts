import { NextResponse } from "next/server";

import { fetchJobBoardFilters } from "@/lib/jobs/fetch-job-board-filters";

export async function GET() {
  try {
    const filters = await fetchJobBoardFilters();

    return NextResponse.json({
      success: true,
      filters,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load job filters.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
