"use client";

import { useState, type ReactNode } from "react";

export type SettingsSection = {
  id: string;
  label: string;
  description?: string;
  content: ReactNode;
  contentMaxWidth?: "narrow" | "full";
};

type SettingsPageLayoutProps = {
  sections: SettingsSection[];
  defaultSectionId?: string;
};

export function SettingsPageLayout({
  sections,
  defaultSectionId,
}: SettingsPageLayoutProps) {
  const [activeId, setActiveId] = useState(() => {
    if (
      defaultSectionId &&
      sections.some((section) => section.id === defaultSectionId)
    ) {
      return defaultSectionId;
    }

    return sections[0]?.id ?? "";
  });

  const activeSection =
    sections.find((section) => section.id === activeId) ?? sections[0];

  if (!activeSection) {
    return null;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 sm:mb-8 sm:text-4xl">
        Settings
      </h1>

      <div className="flex min-h-[50vh] flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        <nav
          aria-label="Settings sections"
          className="flex shrink-0 flex-col self-stretch rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:w-56 lg:self-stretch xl:w-60"
        >
          <ul className="space-y-1 lg:flex-1">
            {sections.map((section) => {
              const isActive = section.id === activeSection.id;

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex w-full items-center rounded-lg py-2.5 pl-4 pr-3 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50/80 font-medium text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-blue-600"
                      />
                    ) : null}
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col self-stretch rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <header className="mb-6 pb-1 sm:mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              {activeSection.label}
            </h2>
            {activeSection.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                {activeSection.description}
              </p>
            ) : null}
          </header>

          <div
            className={`flex-1 ${
              activeSection.contentMaxWidth === "full" ? "" : "max-w-2xl"
            }`}
          >
            {activeSection.content}
          </div>
        </div>
      </div>
    </div>
  );
}
