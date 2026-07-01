import type { LocationCountry } from "@/lib/locations/types";

let countriesPromise: Promise<LocationCountry[]> | null = null;
const citiesCache = new Map<string, string[]>();

export async function fetchCountries(): Promise<LocationCountry[]> {
  if (!countriesPromise) {
    countriesPromise = fetch("/data/countries.json").then(async (response) => {
      if (!response.ok) {
        throw new Error("Unable to load countries.");
      }

      return response.json() as Promise<LocationCountry[]>;
    });
  }

  return countriesPromise;
}

export function getCountryCode(
  countries: readonly LocationCountry[],
  countryName: string,
): string | null {
  const normalized = countryName.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    countries.find((country) => country.name.toLowerCase() === normalized)?.code ??
    null
  );
}

export async function fetchCitiesForCountryCode(
  countryCode: string,
): Promise<string[]> {
  const code = countryCode.trim().toUpperCase();

  if (!code) {
    return [];
  }

  const cached = citiesCache.get(code);

  if (cached) {
    return cached;
  }

  const response = await fetch(`/data/cities/${code}.json`);

  if (!response.ok) {
    throw new Error("Unable to load cities.");
  }

  const cities = (await response.json()) as string[];
  citiesCache.set(code, cities);
  return cities;
}
