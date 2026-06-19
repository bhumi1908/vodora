import type { CandidateJob, CandidateJobFilters } from "@/lib/jobs/candidate-jobs.types";

function matchesLocation(job: CandidateJob, locationFilter: string): boolean {
  if (locationFilter === "All Locations") {
    return true;
  }

  const locLower = job.location.toLowerCase();
  const selLower = locationFilter.toLowerCase();

  if (selLower === "remote") {
    return locLower.includes("remote");
  }

  if (selLower === "australia") {
    return locLower.includes("australia");
  }

  if (selLower === "uk") {
    return locLower.includes("uk");
  }

  if (selLower === "canada") {
    return locLower.includes("canada");
  }

  return true;
}

export function filterCandidateJobs(
  jobs: CandidateJob[],
  filters: CandidateJobFilters,
): CandidateJob[] {
  const query = filters.query.trim().toLowerCase();

  return jobs.filter((job) => {
    if (filters.category !== "All" && job.category !== filters.category) {
      return false;
    }

    if (
      filters.workTypes.length > 0 &&
      !filters.workTypes.includes(job.type)
    ) {
      return false;
    }

    if (!matchesLocation(job, filters.location)) {
      return false;
    }

    if (query) {
      const matchesQuery =
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query);

      if (!matchesQuery) {
        return false;
      }
    }

    return true;
  });
}

export function getCategoryJobCount(
  jobs: CandidateJob[],
  category: string,
): number {
  if (category === "All") {
    return jobs.length;
  }

  return jobs.filter((job) => job.category === category).length;
}
