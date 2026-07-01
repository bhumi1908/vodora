export type ViewerLocation = {
  city: string | null;
  country: string | null;
};

/**
 * Rank 0 = same city + country, 1 = same country only, 2 = elsewhere.
 * Used to sort job postings so nearby roles appear first.
 */
export function jobLocationProximityRank(
  jobLocation: string,
  viewer: ViewerLocation | null,
): number {
  const city = viewer?.city?.trim();
  const country = viewer?.country?.trim();

  if (!city || !country) {
    return 1;
  }

  const normalizedLocation = jobLocation.toLowerCase();
  const normalizedCity = city.toLowerCase();
  const normalizedCountry = country.toLowerCase();

  const hasCity = normalizedLocation.includes(normalizedCity);
  const hasCountry = normalizedLocation.includes(normalizedCountry);

  if (hasCity && hasCountry) {
    return 0;
  }

  if (hasCountry) {
    return 1;
  }

  return 2;
}

export function sortJobPostingsByProximity<T extends { location: string; published_at: string | null; created_at: string }>(
  rows: T[],
  viewer: ViewerLocation | null,
): T[] {
  return [...rows].sort((left, right) => {
    const rankDiff =
      jobLocationProximityRank(left.location, viewer) -
      jobLocationProximityRank(right.location, viewer);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    const leftPublished = left.published_at ?? left.created_at;
    const rightPublished = right.published_at ?? right.created_at;

    return rightPublished.localeCompare(leftPublished);
  });
}
