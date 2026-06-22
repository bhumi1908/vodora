"use client";

import { useState } from "react";
import {
  CheckCircle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Star,
  Send,
  Sparkles,
} from "lucide-react";

import type { FeedbackType } from "@/lib/feedback/validation";

const FEATURES = [
  "Candidate Profile",
  "References System",
  "Documents Tab",
  "Job Board",
  "Recruiter Search",
  "Recruiter Profile",
  "Recruiter Dashboard",
  "Messaging",
  "Find Recruiters",
  "Admin Dashboard",
  "Invite Colleagues",
  "Profile Completion",
  "Visitor / Privacy View",
  "Navigation & Layout",
  "Other",
];

const FEEDBACK_TYPES: {
  id: FeedbackType;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  active: string;
}[] = [
  {
    id: "working",
    label: "Working Great",
    desc: "This feature is doing exactly what I need",
    icon: ThumbsUp,
    color:
      "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700",
    active: "border-green-500 bg-green-50 text-green-700",
  },
  {
    id: "not-working",
    label: "Not Working",
    desc: "Something is broken or not behaving right",
    icon: ThumbsDown,
    color:
      "border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-600",
    active: "border-red-500 bg-red-50 text-red-600",
  },
  {
    id: "needs-improvement",
    label: "Needs Improvement",
    desc: "It works but could be better",
    icon: Wrench,
    color:
      "border-gray-200 text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700",
    active: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    id: "new-feature",
    label: "New Feature Idea",
    desc: "I'd love to see something that doesn't exist yet",
    icon: Lightbulb,
    color:
      "border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700",
    active: "border-blue-500 bg-blue-50 text-blue-700",
  },
];

const ROLES = [
  "Candidate",
  "Recruiter",
  "Hiring Manager",
  "Staffing Agency",
  "Just browsing",
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors sm:h-8 sm:w-8 ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
      <span className="mt-1 w-full text-sm text-gray-500 sm:mt-0 sm:ml-2 sm:w-auto">
        {value === 1
          ? "Poor"
          : value === 2
            ? "Fair"
            : value === 3
              ? "Good"
              : value === 4
                ? "Very good"
                : value === 5
                  ? "Excellent"
                  : ""}
      </span>
    </div>
  );
}

interface FeedbackPageProps {
  alreadySubmitted?: boolean;
  userEmail?: string;
}

export function FeedbackPage({
  alreadySubmitted = false,
  userEmail = "",
}: FeedbackPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [alreadyFilled, setAlreadyFilled] = useState(alreadySubmitted);
  const [role, setRole] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [details, setDetails] = useState("");
  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [email, setEmail] = useState(userEmail);
  const [canContact, setCanContact] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const canSubmit =
    role && overallRating > 0 && feedbackType && details.trim().length > 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !feedbackType || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          overallRating,
          feedbackType,
          selectedFeature: selectedFeature || undefined,
          details,
          newFeatureTitle: newFeatureTitle || undefined,
          email: canContact ? email : undefined,
          canContact,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        alreadySubmitted?: boolean;
      };

      if (!response.ok) {
        if (data.alreadySubmitted) {
          setAlreadyFilled(true);
        }
        setSubmitError(
          data.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyFilled) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-8 sm:min-h-[70vh] sm:py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 sm:mb-6 sm:h-20 sm:w-20">
            <CheckCircle className="h-8 w-8 text-blue-600 sm:h-10 sm:w-10" />
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
            Feedback already received
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 sm:text-base">
            You have already filled out this form. Thank you for helping shape
            Vodora — we read every submission.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-8 sm:min-h-[70vh] sm:py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 sm:mb-6 sm:h-20 sm:w-20">
            <CheckCircle className="h-8 w-8 text-green-600 sm:h-10 sm:w-10" />
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
            Thank you!
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500 sm:mb-8 sm:text-base">
            Your feedback has been received. Every submission is read by our team
            and directly shapes what we build next on Vodora.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-10">
        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 sm:mb-4 sm:px-4 sm:text-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Shape the future of Vodora
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900 sm:mb-3 sm:text-3xl lg:text-4xl">
          We&apos;d love your feedback
        </h1>
        <p className="text-base leading-relaxed text-gray-500 sm:text-lg">
          You&apos;re building Vodora with us. Tell us what&apos;s working,
          what&apos;s broken, and what you&apos;d love to see next — every
          submission goes directly to our product team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
            Who are you on Vodora?
          </h2>
          <p className="mb-3 text-sm text-gray-400 sm:mb-4">Helps us understand context</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-xl border-2 px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                  role === r
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
            Overall, how would you rate Vodora?
          </h2>
          <p className="mb-4 text-sm text-gray-400 sm:mb-5">
            Your honest opinion matters
          </p>
          <StarRating value={overallRating} onChange={setOverallRating} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
            What kind of feedback do you have?
          </h2>
          <p className="mb-4 text-sm text-gray-400 sm:mb-5">
            Pick the one that best describes your experience
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEEDBACK_TYPES.map(({ id, label, desc, icon: Icon, color, active }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFeedbackType(id)}
                className={`flex w-full min-w-0 items-start gap-3 rounded-xl border-2 p-3 text-left transition-all sm:p-4 ${
                  feedbackType === id ? active : color
                }`}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs leading-snug opacity-70">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
            Which area does this relate to?
          </h2>
          <p className="mb-3 text-sm text-gray-400 sm:mb-4">
            Optional — select the feature or area
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFeature(selectedFeature === f ? "" : f)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                  selectedFeature === f
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">Tell us more</h2>
          <p className="mb-3 text-sm text-gray-400 sm:mb-4">
            {feedbackType === "new-feature"
              ? "Describe the feature you'd love to see"
              : feedbackType === "not-working"
                ? "What's happening? What did you expect?"
                : "Share as much detail as you like"}
          </p>

          {feedbackType === "new-feature" && (
            <input
              type="text"
              value={newFeatureTitle}
              onChange={(e) => setNewFeatureTitle(e.target.value)}
              placeholder="Feature title (e.g. Video reference testimonials)"
              className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <textarea
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={
              feedbackType === "new-feature"
                ? "Describe what this feature would do, who it helps, and why it matters to you…"
                : feedbackType === "not-working"
                  ? "Steps to reproduce, what you expected vs. what happened…"
                  : "Your feedback here…"
            }
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p
            className={`mt-1.5 text-xs ${
              details.length < 10 && details.length > 0
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {details.length} characters{" "}
            {details.length < 10 ? `(${10 - details.length} more needed)` : ""}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-2xl sm:p-6">
          <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
            Can we follow up with you?
          </h2>
          <p className="mb-3 text-sm text-gray-400 sm:mb-4">
            Optional — we may reach out to learn more
          </p>
          <label className="mb-4 flex cursor-pointer items-start gap-3 sm:items-center">
            <input
              type="checkbox"
              checked={canContact}
              onChange={(e) => setCanContact(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:mt-0"
            />
            <span className="text-sm leading-snug text-gray-700">
              Yes, you can contact me about my feedback
            </span>
          </label>
          {canContact && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {submitError ? (
          <p className="text-center text-sm text-red-500">{submitError}</p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:py-4 sm:text-base"
        >
          <Send className="h-5 w-5" />
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>
        <p className="text-center text-xs text-gray-400">
          Your feedback is linked to your account. We only use your email if you
          opt in above.
        </p>
      </form>
    </div>
  );
}
