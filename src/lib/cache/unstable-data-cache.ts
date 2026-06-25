import { unstable_cache } from "next/cache";

/** Reference lookup tables (categories, work types, job titles). */
export const LOOKUP_REVALIDATE_SECONDS = 60 * 60;

/** Semi-static filter metadata (specialisations, directory counts). */
export const FILTER_REVALIDATE_SECONDS = 5 * 60;

export function createDataCache<T>(
  fn: () => Promise<T>,
  keys: string[],
  revalidateSeconds: number,
) {
  return unstable_cache(fn, keys, { revalidate: revalidateSeconds });
}
