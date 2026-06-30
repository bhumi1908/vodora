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
    <div className="mx-auto flex w-full min-h-[50vh] min-w-0 max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 sm:mb-8 sm:text-4xl">
        Settings
      </h1>

      <div className="flex min-h-[50vh] flex-1 flex-col lg:flex-row lg:items-stretch">
        <nav
          aria-label="Settings sections"
          className="shrink-0 lg:max-w-[13rem] lg:pr-4"
        >
          <ul className="space-y-0.5">
            {sections.map((section) => {
              const isActive = section.id === activeSection.id;

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center rounded-lg px-4 py-3.5 text-left text-sm transition-colors lg:px-3 lg:py-2.5 ${isActive
                        ? "bg-blue-50 font-medium text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          aria-hidden="true"
          className="hidden bg-gray-200 lg:mx-4 lg:block lg:w-px lg:self-stretch"
        />

        <div
          className={
            activeSection.contentMaxWidth === "narrow"
              ? "flex w-full max-w-2xl min-w-0 flex-1 flex-col lg:pl-6 lg:pr-2"
              : "flex min-w-0 flex-1 flex-col lg:pl-6 lg:pr-2"
          }
        >
          <header className="mb-6 border-b border-gray-100 pb-5 sm:mb-8 sm:pb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              {activeSection.label}
            </h2>
            {activeSection.description ? (
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                {activeSection.description}
              </p>
            ) : null}
          </header>

          <div className="flex-1">{activeSection.content}</div>
        </div>
      </div>
    </div>
  );
}
