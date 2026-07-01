"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import {
  AuthFormGrid,
  FieldError,
  FormSelect,
} from "@/components/auth/shared/FormFields";
import {
  fetchCitiesForCountryCode,
  fetchCountries,
  getCountryCode,
} from "@/lib/locations/fetch-locations";
import type { LocationCountry } from "@/lib/locations/types";

type CountryCityFieldsProps = {
  idPrefix: string;
  country: string;
  city: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  countryError?: string;
  cityError?: string;
  required?: boolean;
  disabled?: boolean;
};

export function CountryCityFields({
  idPrefix,
  country,
  city,
  onCountryChange,
  onCityChange,
  countryError,
  cityError,
  required = true,
  disabled = false,
}: CountryCityFieldsProps) {
  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      setCountriesLoading(true);
      setLoadError("");

      try {
        const nextCountries = await fetchCountries();

        if (!cancelled) {
          setCountries(nextCountries);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Unable to load countries. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setCountriesLoading(false);
        }
      }
    }

    void loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCountryCode = useMemo(
    () => getCountryCode(countries, country),
    [countries, country],
  );

  useEffect(() => {
    if (!selectedCountryCode) {
      setCities([]);
      setCitiesLoading(false);
      return;
    }

    const countryCode = selectedCountryCode;
    let cancelled = false;

    async function loadCities() {
      setCitiesLoading(true);
      setLoadError("");

      try {
        const nextCities = await fetchCitiesForCountryCode(countryCode);

        if (!cancelled) {
          setCities(nextCities);
        }
      } catch {
        if (!cancelled) {
          setCities([]);
          setLoadError("Unable to load cities. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    }

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [selectedCountryCode]);

  const countryOptions = useMemo(
    () => countries.map((entry) => ({ value: entry.name, label: entry.name })),
    [countries],
  );

  const cityOptions = useMemo(
    () => cities.map((entry) => ({ value: entry, label: entry })),
    [cities],
  );

  function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
    onCountryChange(event.target.value);
    onCityChange("");
  }

  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    onCityChange(event.target.value);
  }

  const countrySelectDisabled = disabled || countriesLoading || countries.length === 0;
  const citySelectDisabled =
    disabled || !country || citiesLoading || cityOptions.length === 0;

  return (
    <>
      <AuthFormGrid>
        <FormSelect
          id={`${idPrefix}-country`}
          label="Country"
          required={required}
          value={country}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder={countriesLoading ? "Loading countries..." : "Select country"}
          searchPlaceholder="Search countries..."
          searchable
          disabled={countrySelectDisabled}
          error={countryError}
        />
        <FormSelect
          id={`${idPrefix}-city`}
          label="City"
          required={required}
          value={city}
          onChange={handleCityChange}
          options={cityOptions}
          placeholder={
            !country
              ? "Select country first"
              : citiesLoading
                ? "Loading cities..."
                : "Select city"
          }
          searchPlaceholder="Search cities..."
          searchable
          disabled={citySelectDisabled}
          error={cityError}
        />
      </AuthFormGrid>
      {loadError ? <FieldError message={loadError} /> : null}
    </>
  );
}
