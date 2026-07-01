import { TrustTabs } from "./TrustTabs";
import { TRUST_TABS } from "./constants";

export function TrustIssuesSection() {
  return (
    <section
      aria-label="Hiring trust issues"
      className="bg-[#FAFAFA] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:gap-10">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl lg:text-[2.5rem]">
            Hiring Trust Is Broken
          </h2>
          <TrustTabs tabs={TRUST_TABS} defaultTabId={TRUST_TABS[0].id} />
        </div>
      </div>
    </section>
  );
}
