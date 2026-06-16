import type { ReactNode } from "react";

interface StaticPageShellProps {
  children: ReactNode;
  narrow?: boolean;
}

export function StaticPageShell({
  children,
  narrow = false,
}: StaticPageShellProps) {
  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-8 sm:py-20">
      <div
        className={`mx-auto ${narrow ? "max-w-3xl" : "max-w-4xl"}`}
      >
        {children}
      </div>
    </div>
  );
}

interface StaticPageHeaderProps {
  title: string;
  description?: string;
  large?: boolean;
}

export function StaticPageHeader({
  title,
  description,
  large = false,
}: StaticPageHeaderProps) {
  return (
    <div className={description ? "mb-12 sm:mb-16" : "mb-12"}>
      <h1
        className={`mb-4 font-semibold text-gray-900 ${
          large
            ? "text-4xl sm:text-5xl lg:text-6xl"
            : "text-4xl sm:text-5xl"
        }`}
      >
        {title}
      </h1>
      {description ? (
        <p className="text-lg text-gray-600 sm:text-xl">{description}</p>
      ) : null}
    </div>
  );
}

interface LegalSection {
  title: string;
  body: string;
}

interface LegalDocumentPageProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalDocumentPage({
  title,
  lastUpdated,
  sections,
}: LegalDocumentPageProps) {
  return (
    <StaticPageShell narrow>
      <StaticPageHeader title={title} />
      <p className="mb-12 text-gray-500">Last updated: {lastUpdated}</p>
      {sections.map((section) => (
        <div key={section.title} className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            {section.title}
          </h2>
          <p className="leading-relaxed text-gray-600">{section.body}</p>
        </div>
      ))}
    </StaticPageShell>
  );
}
