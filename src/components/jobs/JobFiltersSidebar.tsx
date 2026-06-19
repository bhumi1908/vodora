"use client";

import { SlidersHorizontal } from "lucide-react";

import { FilterSection } from "@/components/jobs/FilterSection";
import {
  JOB_CATEGORIES,
  JOB_LOCATIONS,
  JOB_WORK_TYPES,
} from "@/lib/jobs/job-board-options";

type JobFiltersSidebarProps = {
  selectedCategory: string;
  selectedTypes: string[];
  selectedLocation: string;
  categoryCounts: Record<string, number>;
  onCategoryChange: (category: string) => void;
  onToggleType: (type: string) => void;
  onLocationChange: (location: string) => void;
  onClearFilters: () => void;
  className?: string;
};

function getCategoryCount(
  categoryCounts: Record<string, number>,
  category: string,
): number {
  return categoryCounts[category] ?? 0;
}

export function JobFiltersSidebar({
  selectedCategory,
  selectedTypes,
  selectedLocation,
  categoryCounts,
  onCategoryChange,
  onToggleType,
  onLocationChange,
  onClearFilters,
  className = "",
}: JobFiltersSidebarProps) {
  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedTypes.length > 0 ||
    selectedLocation !== "All Locations";

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedTypes.length > 0,
    selectedLocation !== "All Locations",
  ].filter(Boolean).length;

  return (
    <aside className={className}>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-24">
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
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          ) : null}
        </div>

        <FilterSection title="Category">
          <div className="space-y-1">
            {JOB_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {category}
                <span className="float-right text-xs text-gray-400">
                  {getCategoryCount(categoryCounts, category)}
                </span>
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Work Type">
          <div className="space-y-2">
            {JOB_WORK_TYPES.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => onToggleType(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Location">
          <div className="space-y-1">
            {JOB_LOCATIONS.map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => onLocationChange(location)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selectedLocation === location
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
