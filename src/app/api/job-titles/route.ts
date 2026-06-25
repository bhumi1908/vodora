import { NextResponse } from "next/server";

import { LOOKUP_REVALIDATE_SECONDS } from "@/lib/cache/unstable-data-cache";
import { getCachedJobTitleOptionGroups } from "@/lib/job-titles/fetch-job-titles";

export async function GET() {
  try {
    const optionGroups = await getCachedJobTitleOptionGroups();

    return NextResponse.json(
      {
        success: true,
        optionGroups,
      },
      {
        headers: {
          "Cache-Control": `private, max-age=${LOOKUP_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
        },
      },
    );
  } catch (error) {
    console.error("Failed to load job titles:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load job titles." },
      { status: 500 },
    );
  }
}
