"use client";

import { Building2, CheckCircle, Users, X, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type BillingCycle = "monthly" | "annual";
type PricingTab = "candidates" | "recruiters";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: { monthly: number | null; annual: number | null };
  description: string;
  icon: typeof Users;
  highlight: boolean;
  cta: string;
  ctaLink: string;
  features: PlanFeature[];
}

const candidatePlans: Plan[] = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description:
      "Build your professional profile and start collecting references.",
    icon: Users,
    highlight: false,
    cta: "Create Free Profile",
    ctaLink: "/signup/candidate",
    features: [
      { text: "Professional profile", included: true },
      { text: "Up to 3 verified references", included: true },
      { text: "Basic employment history", included: true },
      { text: "Share profile link", included: true },
      { text: "Skills & endorsements", included: true },
      { text: "Unlimited references", included: false },
      { text: "Priority verification", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Custom profile URL", included: false },
    ],
  },
  {
    name: "Professional",
    price: { monthly: 12, annual: 9 },
    description: "Everything you need to own your professional reputation.",
    icon: Zap,
    highlight: true,
    cta: "Get Started",
    ctaLink: "/signup/candidate",
    features: [
      { text: "Professional profile", included: true },
      { text: "Unlimited verified references", included: true },
      { text: "Full employment history", included: true },
      { text: "Share profile link", included: true },
      { text: "Skills & endorsements", included: true },
      { text: "Priority verification", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Custom profile URL", included: true },
      { text: "Reference request templates", included: true },
    ],
  },
];

const recruiterPlans: Plan[] = [
  {
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    description: "For small teams hiring occasional talent.",
    icon: Users,
    highlight: false,
    cta: "Start Free Trial",
    ctaLink: "/signup/recruiter",
    features: [
      { text: "Search verified candidates", included: true },
      { text: "Up to 3 active job posts", included: true },
      { text: "Basic filters", included: true },
      { text: "Candidate shortlisting", included: true },
      { text: "Email support", included: true },
      { text: "Advanced filters", included: false },
      { text: "Talent pipeline CRM", included: false },
      { text: "Team collaboration", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Growth",
    price: { monthly: 149, annual: 119 },
    description: "For growing teams with active hiring needs.",
    icon: Zap,
    highlight: true,
    cta: "Start Free Trial",
    ctaLink: "/signup/recruiter",
    features: [
      { text: "Search verified candidates", included: true },
      { text: "Unlimited job posts", included: true },
      { text: "Advanced filters", included: true },
      { text: "Candidate shortlisting", included: true },
      { text: "Priority support", included: true },
      { text: "Talent pipeline CRM", included: true },
      { text: "Team collaboration (5 seats)", included: true },
      { text: "API access", included: false },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: { monthly: null, annual: null },
    description: "For staffing agencies and large hiring organisations.",
    icon: Building2,
    highlight: false,
    cta: "Contact Sales",
    ctaLink: "/contact-us",
    features: [
      { text: "Search verified candidates", included: true },
      { text: "Unlimited job posts", included: true },
      { text: "Advanced filters", included: true },
      { text: "Candidate shortlisting", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Talent pipeline CRM", included: true },
      { text: "Unlimited team seats", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

const pricingFaqs = [
  {
    q: "Is the candidate free plan really free?",
    a: "Yes. Creating a profile, collecting up to 3 verified references, and sharing your profile is 100% free for candidates — forever.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no lock-in contracts. Cancel your subscription at any time and keep access until the end of your billing period.",
  },
  {
    q: "Do you offer a free trial for recruiter plans?",
    a: "Yes. All recruiter plans come with a 14-day free trial, no credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) as well as bank transfers for annual enterprise plans.",
  },
];

function PlanCard({ plan, billing }: { plan: Plan; billing: BillingCycle }) {
  const Icon = plan.icon;
  const price = plan.price[billing];

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-6 sm:p-8 ${
        plan.highlight
          ? "border-blue-600 bg-blue-600 text-white shadow-2xl lg:scale-105"
          : "border-gray-200 bg-white"
      }`}
    >
      {plan.highlight ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white sm:-top-4 sm:px-4 sm:text-sm">
          Most Popular
        </div>
      ) : null}

      <div className="mb-6">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
            plan.highlight ? "bg-white/20" : "bg-blue-50"
          }`}
        >
          <Icon
            className={`h-5 w-5 sm:h-6 sm:w-6 ${plan.highlight ? "text-white" : "text-blue-600"}`}
          />
        </div>
        <h3
          className={`mb-2 text-lg font-semibold sm:text-xl ${plan.highlight ? "text-white" : "text-gray-900"}`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-sm ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-6 sm:mb-8">
        {price !== null ? (
          <div className="flex flex-wrap items-baseline gap-1">
            <span
              className={`text-4xl font-bold sm:text-5xl ${plan.highlight ? "text-white" : "text-gray-900"}`}
            >
              ${price}
            </span>
            <span
              className={`text-sm ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}
            >
              /mo{billing === "annual" ? " billed annually" : ""}
            </span>
          </div>
        ) : (
          <div
            className={`text-2xl font-bold sm:text-3xl ${plan.highlight ? "text-white" : "text-gray-900"}`}
          >
            Custom
          </div>
        )}
      </div>

      <ul className="mb-6 flex-1 space-y-3 sm:mb-8">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            {feature.included ? (
              <CheckCircle
                className={`mt-0.5 h-5 w-5 shrink-0 ${plan.highlight ? "text-blue-200" : "text-blue-600"}`}
              />
            ) : (
              <X
                className={`mt-0.5 h-5 w-5 shrink-0 ${plan.highlight ? "text-blue-300/50" : "text-gray-300"}`}
              />
            )}
            <span
              className={`text-sm ${
                plan.highlight
                  ? feature.included
                    ? "text-white"
                    : "text-blue-200/50"
                  : feature.included
                    ? "text-gray-700"
                    : "text-gray-300"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaLink}
        className={`block rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors sm:text-base ${
          plan.highlight
            ? "bg-white text-blue-600 hover:bg-gray-100"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [tab, setTab] = useState<PricingTab>("candidates");

  const plans = tab === "candidates" ? candidatePlans : recruiterPlans;
  const isThreeColumn = plans.length === 3;

  return (
    <div className="min-h-screen bg-white">
      <section className="px-4 pt-12 pb-10 text-center sm:px-6 sm:pt-16 sm:pb-12 lg:px-8 lg:pt-20 lg:pb-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-semibold text-gray-900 sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mb-8 text-base text-gray-600 sm:mb-10 sm:text-lg lg:text-xl">
            Own your professional reputation for free. Upgrade when you&apos;re
            ready.
          </p>

          <div className="mb-6 inline-flex w-full max-w-xs rounded-xl bg-gray-100 p-1 sm:mb-8 sm:w-auto sm:max-w-none">
            <button
              type="button"
              onClick={() => setTab("candidates")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-6 ${
                tab === "candidates"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              For Candidates
            </button>
            <button
              type="button"
              onClick={() => setTab("recruiters")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-6 ${
                tab === "recruiters"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              For Recruiters
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <span
              className={`text-sm font-medium ${billing === "monthly" ? "text-gray-900" : "text-gray-500"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              aria-label={`Switch to ${billing === "monthly" ? "annual" : "monthly"} billing`}
              onClick={() =>
                setBilling(billing === "monthly" ? "annual" : "monthly")
              }
              className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${
                billing === "annual" ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  billing === "annual" ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span
              className={`flex flex-wrap items-center justify-center gap-2 text-sm font-medium ${
                billing === "annual" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
              <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div
          className={`mx-auto grid grid-cols-1 items-stretch gap-6 sm:gap-8 ${
            isThreeColumn
              ? "max-w-[1200px] md:grid-cols-2 lg:grid-cols-3 lg:items-center"
              : "max-w-[800px] sm:grid-cols-2 lg:items-center"
          }`}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} billing={billing} />
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900 sm:mb-12 sm:text-3xl lg:text-4xl">
            Pricing FAQs
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {pricingFaqs.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
              >
                <h3 className="mb-2 font-semibold text-gray-900">{item.q}</h3>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-14 text-center text-white sm:px-6 sm:py-20 lg:px-8">
        <h2 className="mb-3 text-2xl font-semibold sm:mb-4 sm:text-3xl lg:text-4xl xl:text-5xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-base text-blue-100 sm:text-lg lg:text-xl">
          Join thousands of professionals who already own their reputation on
          Vodora.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/signup/candidate"
            className="rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-gray-100 sm:px-8 sm:py-4 sm:text-base"
          >
            Create Free Profile
          </Link>
          <Link
            href="/signup/recruiter"
            className="rounded-lg bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 sm:px-8 sm:py-4 sm:text-base"
          >
            Recruiter Sign Up
          </Link>
        </div>
      </section>
    </div>
  );
}
