"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";

import type { ProfileCompletionItem } from "@/lib/profile/profile-completion";

type ProfileCompletionCircleProps = {
  percent: number;
  items: ProfileCompletionItem[];
};

function CompletionRing({ percent }: { percent: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const color =
    percent >= 80 ? "#16a34a" : percent >= 60 ? "#2563eb" : "#f59e0b";

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg width="80" height="80" className="-rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base leading-none font-bold text-gray-900">
          {percent}%
        </span>
        <span className="mt-0.5 text-[10px] leading-none text-gray-500">
          complete
        </span>
      </div>
    </div>
  );
}

export function ProfileCompletionCircle({
  percent,
  items,
}: ProfileCompletionCircleProps) {
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDetails) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDetails(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDetails(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDetails]);

  const detailsId = "profile-completion-details";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setShowDetails((open) => !open)}
        aria-expanded={showDetails}
        aria-controls={detailsId}
        aria-label={`Profile ${percent}% complete. ${showDetails ? "Hide" : "View"} completion tips.`}
        className="group flex flex-col items-center gap-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <CompletionRing percent={percent} />
        <span className="text-xs text-gray-400 transition-colors group-hover:text-blue-600">
          {showDetails ? "Hide tips" : "View tips"}
        </span>
      </button>

      {showDetails ? (
        <>
          <button
            type="button"
            aria-label="Close profile completion details"
            className="fixed inset-0 z-40 bg-black/25 sm:hidden"
            onClick={() => setShowDetails(false)}
          />
          <div
            id={detailsId}
            role="region"
            aria-label="Profile completion checklist"
            className="fixed inset-x-4 top-1/2 z-50 max-h-[min(80vh,28rem)] w-auto -translate-y-1/2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:absolute sm:inset-x-auto sm:top-[5.75rem] sm:right-0 sm:left-auto sm:max-h-none sm:w-72 sm:translate-y-0"
          >
            <h3 className="mb-3 font-semibold text-gray-900">
              Profile Completion
            </h3>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 min-w-0 flex-1 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-bold text-green-700">
                {percent}%
              </span>
            </div>
            <div className="space-y-2.5">
              {items.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <CheckCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.done ? "text-green-500" : "text-gray-200"
                    }`}
                  />
                  <span
                    className={`min-w-0 flex-1 text-xs leading-snug ${
                      item.done ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  {!item.done ? (
                    <span className="shrink-0 text-xs font-medium text-blue-600">
                      +{item.weight}%
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
