"use client";

import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import type { RecruiterSearchFilters } from "@/lib/recruiter/search.types";

const availabilityOptions = ["All", "Immediately", "2 weeks", "1 month"];
const experienceLevels = ["Any", "0-3 years", "4-7 years", "8+ years"];
const referenceFilters = ["Any", "5+ references", "8+ references", "10+ references"];

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border-b border-gray-100 pb-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-gray-900"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open ? children : null}
    </div>
  );
}

export type CandidateSearchFilterState = {
  selectedCategoryId: string;
  selectedAvailability: string;
  selectedWorkTypeCodes: string[];
  selectedCountry: string;
  selectedExperience: string;
  selectedRefs: string;
};

type CandidateSearchFiltersPanelProps = {
  filters: RecruiterSearchFilters;
  state: CandidateSearchFilterState;
  onCategoryChange: (categoryId: string) => void;
  onAvailabilityChange: (availability: string) => void;
  onWorkTypeToggle: (code: string) => void;
  onCountryChange: (country: string) => void;
  onExperienceChange: (experience: string) => void;
  onReferencesChange: (references: string) => void;
  onClearAll: () => void;
};

export function CandidateSearchFiltersPanel({
  filters,
  state,
  onCategoryChange,
  onAvailabilityChange,
  onWorkTypeToggle,
  onCountryChange,
  onExperienceChange,
  onReferencesChange,
  onClearAll,
}: CandidateSearchFiltersPanelProps) {
  const activeFilterCount = [
    state.selectedCategoryId !== "",
    state.selectedAvailability !== "All",
    state.selectedWorkTypeCodes.length > 0,
    state.selectedCountry !== "All",
    state.selectedExperience !== "Any",
    state.selectedRefs !== "Any",
  ].filter(Boolean).length;

  const categories = useMemo(
    () => [{ id: "", name: "All" }, ...filters.categories],
    [filters.categories],
  );

  const countries = useMemo(
    () => ["All", ...filters.countries],
    [filters.countries],
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <FilterSection title="Category">
        <div className="space-y-1.5">
          {categories.map((category) => (
            <button
              key={category.id || "all"}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                state.selectedCategoryId === category.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-1.5">
          {availabilityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onAvailabilityChange(option)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                state.selectedAvailability === option
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Work Type">
        <div className="space-y-2">
          {filters.workTypes.map((workType) => (
            <label key={workType.code} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={state.selectedWorkTypeCodes.includes(workType.code)}
                onChange={() => onWorkTypeToggle(workType.code)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">{workType.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Country">
        <div className="space-y-1.5">
          {countries.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => onCountryChange(country)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                state.selectedCountry === country
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Experience" defaultOpen={false}>
        <div className="space-y-1.5">
          {experienceLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onExperienceChange(level)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                state.selectedExperience === level
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="References" defaultOpen={false}>
        <div className="space-y-1.5">
          {referenceFilters.map((reference) => (
            <button
              key={reference}
              type="button"
              onClick={() => onReferencesChange(reference)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                state.selectedRefs === reference
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {reference}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );
}

export function getActiveCandidateSearchFilterCount(
  state: CandidateSearchFilterState,
): number {
  return [
    state.selectedCategoryId !== "",
    state.selectedAvailability !== "All",
    state.selectedWorkTypeCodes.length > 0,
    state.selectedCountry !== "All",
    state.selectedExperience !== "Any",
    state.selectedRefs !== "Any",
  ].filter(Boolean).length;
}
