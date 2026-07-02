"use client";

import {
  ArrowRight,
  CheckCircle,
  Clock,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { FaqAccordion } from "@/components/landing/shared/FaqAccordion";
import { AnimateIn } from "@/components/landing/shared/AnimateIn";
import { LandingSmoothScroll } from "@/components/landing/shared/LandingSmoothScroll";
import { SectionContainer } from "@/components/landing/shared/SectionContainer";
import { RecruiterSiteHeader } from "@/components/layout/RecruiterSiteHeader";

const recruiterFaqs = [
  {
    q: "How are candidate references verified?",
    a: "Each referee provides a reference via corporate email, which Vodora authenticates. We verify the referee's identity, their relationship to the candidate, and their employment at the listed company before the reference appears on a profile.",
  },
  {
    q: "Do candidates control who sees their references?",
    a: "Yes. References are private by default. Candidates share access with specific recruiters. You receive a permission-based view — you never own the data, but you get full access while sharing is active.",
  },
  {
    q: "Can I post jobs directly on Vodora?",
    a: "Yes on Growth and Enterprise plans. Jobs are posted to the verified Vodora talent pool and candidates can apply directly from their profiles.",
  },
  {
    q: "Is there an API for our ATS?",
    a: "API access is available on Enterprise plans. We offer integrations with major ATS platforms. Contact our sales team for a custom integration quote.",
  },
];

export function RecruiterLandingPage() {
  return (
    <LandingSmoothScroll>
    <div className="min-h-screen bg-white">
      <RecruiterSiteHeader />
      <RecruiterHero />
      <TrustStatement />
      <RecruiterPainPoints />
      <HowItWorksRecruiter />
      <RecruiterFeatures />
      <RecruiterSocialProof />
      <RecruiterPricing />
      <FaqAccordion items={recruiterFaqs} title="FAQs" compact />
      <RecruiterCTA />
    </div>
    </LandingSmoothScroll>
  );
}

function RecruiterHero() {
  const trustItems = [
    "No credit card required",
    "14-day free trial",
    "Cancel anytime",
  ];

  return (
    <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <AnimateIn immediate variant="fade-up">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5">
                <Shield className="h-3.5 w-3.5 text-blue-300" />
                <span className="text-sm font-medium text-blue-200">
                  Professional Trust Infrastructure
                </span>
              </div>
              <h1 className="mb-6 text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
                Hire Faster.
                <br />
                Verify <span className="text-blue-400">Once.</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-gray-300 sm:text-xl">
                Access pre-verified candidates with authenticated references
                attached. No more chasing referees — every profile comes with
                verified employment history and trusted reference records.
              </p>
              <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:gap-4">
                <Link
                  href="/login?type=recruiter"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-blue-500 sm:px-8 sm:py-4"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/login?type=recruiter"
                  className="rounded-xl border border-white/20 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-white/10 sm:px-8 sm:py-4"
                >
                  View Demo
                </Link>
              </div>
              <div className="flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                {trustItems.map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </AnimateIn>

          <AnimateIn immediate delay={150} variant="fade-up" className="space-y-4">
            <div className="animate-float rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur sm:p-6">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-400/30">
                    <span className="text-xl font-semibold text-white">SJ</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">Sarah Johnson</p>
                      <span className="rounded-full border border-green-400/30 bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                        Verified
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Senior Software Engineer · San Francisco
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white sm:shrink-0"
                >
                  View Profile
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "References", value: "8 Verified" },
                  { label: "Employment", value: "Confirmed" },
                  { label: "Identity", value: "Verified" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg bg-white/10 px-3 py-2 text-center"
                  >
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-green-300">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                { value: "82%", label: "Faster hiring" },
                { value: "0", label: "Reference calls needed" },
                { value: "100%", label: "Pre-verified talent" },
              ].map(({ value, label }, i) => (
                <AnimateIn key={label} delay={300 + i * 100} variant="scale-in">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400 sm:text-3xl">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{label}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

function TrustStatement() {
  return (
    <section className="animate-shimmer-bar px-4 py-4 sm:px-6 lg:px-8">
      <AnimateIn>
        <p className="mx-auto max-w-[1440px] text-center text-sm text-white/90">
          <span className="font-semibold text-white">Trusted by 2,500+ recruiters</span>{" "}
          at companies including TechCorp, InnovateCo, HireRight, StaffPro, and
          BuildTeam
        </p>
      </AnimateIn>
    </section>
  );
}

function RecruiterPainPoints() {
  const withoutItems = [
    "Spend 4–6 hours per hire on reference checks",
    "Chase referees who ignore calls and emails",
    "Duplicate verification for every new candidate",
    "No standard trust signal across candidates",
    "Manually verify employment with HR departments",
    "Lose top talent to faster-moving competitors",
  ];

  const withItems = [
    "References verified before you even search",
    "Candidate shares authenticated profile instantly",
    "Trust records travel with the candidate forever",
    "Standardised verification across every profile",
    "Employment history confirmed by Vodora",
    "Make offers with confidence in days, not weeks",
  ];

  return (
    <SectionContainer
      id="pain-points"
      className="bg-gray-50 py-16 sm:py-24"
    >
      <div className="mb-10 text-center sm:mb-16">
        <h2 className="mb-4 text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
          The Old Way Is Costing You
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
          Hours chasing referees, weeks verifying credentials, and deals lost to
          slow hiring cycles.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        <AnimateIn delay={100} variant="fade-left">
          <ComparisonCard
            title="Without Vodora"
            titleIcon="✕"
            titleColor="text-red-500"
            borderColor="border-red-100"
            items={withoutItems}
            variant="negative"
          />
        </AnimateIn>
        <AnimateIn delay={200} variant="fade-right">
          <ComparisonCard
            title="With Vodora"
            titleIcon="✓"
            titleColor="text-green-500"
            borderColor="border-green-100"
            items={withItems}
            variant="positive"
          />
        </AnimateIn>
      </div>
    </SectionContainer>
  );
}

function ComparisonCard({
  title,
  titleIcon,
  titleColor,
  borderColor,
  items,
  variant,
}: {
  title: string;
  titleIcon: string;
  titleColor: string;
  borderColor: string;
  items: string[];
  variant: "negative" | "positive";
}) {
  return (
    <div className={`rounded-2xl border bg-white p-6 sm:p-8 ${borderColor}`}>
      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
        <span className={titleColor}>{titleIcon}</span> {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-gray-600">
            {variant === "negative" ? (
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="text-xs text-red-500">✕</span>
              </div>
            ) : (
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            )}
            <span className={variant === "positive" ? "text-gray-700" : ""}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HowItWorksRecruiter() {
  const steps = [
    {
      icon: Search,
      step: "1",
      title: "Search the Directory",
      desc: "Filter verified candidates by role, skill, location, and availability",
    },
    {
      icon: Shield,
      step: "2",
      title: "View Trust Profiles",
      desc: "See verified references, employment history, and credentials upfront",
    },
    {
      icon: Users,
      step: "3",
      title: "Request Sharing",
      desc: "Candidate grants you access to their full reference records in one click",
    },
    {
      icon: Zap,
      step: "4",
      title: "Make an Offer",
      desc: "Hire with confidence — no reference chasing, no verification delays",
    },
  ];

  return (
    <SectionContainer id="how-it-works" className="py-16 sm:py-24">
      <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 sm:mb-16 sm:text-4xl lg:text-5xl">
        How It Works
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, step, title, desc }, i) => (
          <AnimateIn key={step} delay={i * 100} variant="scale-in">
            <div className="relative text-center">
              <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                <Icon className="h-8 w-8 text-white" />
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {step}
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </SectionContainer>
  );
}

function RecruiterFeatures() {
  const features = [
    {
      icon: Search,
      title: "Smart Directory Search",
      desc: "Filter by role, industry, skills, location, availability, experience level, reference count, and more.",
    },
    {
      icon: Shield,
      title: "Pre-Verified References",
      desc: "Every reference is authenticated via corporate email before it appears on a candidate's profile.",
    },
    {
      icon: Clock,
      title: "Save Days Per Hire",
      desc: "Eliminate manual reference collection. Every Vodora candidate arrives pre-checked.",
    },
    {
      icon: TrendingUp,
      title: "Talent Pipeline CRM",
      desc: "Build saved candidate lists, track your pipeline, and collaborate with your team.",
    },
    {
      icon: Users,
      title: "Permission-Based Access",
      desc: "Candidates share their full reference records directly with you — ownership stays with them.",
    },
    {
      icon: Zap,
      title: "Instant Job Posting",
      desc: "Post roles directly to the Vodora talent pool and receive applications from verified candidates.",
    },
  ];

  return (
    <SectionContainer id="features" className="bg-gray-50 py-16 sm:py-24">
      <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
        Everything You Need to Hire Smarter
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-gray-600 sm:mb-16 sm:text-xl">
        Built for in-house teams, staffing agencies, and labour hire companies.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <AnimateIn key={title} delay={i * 80}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </SectionContainer>
  );
}

function RecruiterSocialProof() {
  const testimonials = [
    {
      name: "Amanda Clarke",
      role: "Head of Talent, BuildTeam",
      avatar: "AC",
      quote:
        "We cut our time-to-hire from 6 weeks to 11 days. The verified references mean we skip the back-and-forth entirely.",
    },
    {
      name: "Marcus Webb",
      role: "Director, StaffPro Agency",
      avatar: "MW",
      quote:
        "Vodora has transformed how we place candidates. References are already verified — we just focus on the fit.",
    },
    {
      name: "Priya Nair",
      role: "HR Manager, InnovateCo",
      avatar: "PN",
      quote:
        "The permission-based access model is brilliant. Candidates share on their terms and we get what we need instantly.",
    },
  ];

  return (
    <SectionContainer id="about" className="py-16 sm:py-24">
      <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
        Recruiters Love Vodora
      </h2>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-1 sm:mb-16">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
        ))}
        <span className="ml-2 text-sm text-gray-600">4.9 / 5 from 800+ reviews</span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map(({ name, role, avatar, quote }, i) => (
          <AnimateIn key={name} delay={i * 120}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-6 leading-relaxed text-gray-700 italic">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-semibold text-blue-700">{avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </SectionContainer>
  );
}

function RecruiterPricing() {
  const plans = [
    {
      name: "Starter",
      price: 49,
      desc: "For small teams hiring occasionally",
      features: [
        "Search verified candidates",
        "3 active job posts",
        "Basic filters",
        "Email support",
      ],
      highlight: false,
    },
    {
      name: "Growth",
      price: 149,
      desc: "For active hiring teams",
      features: [
        "Unlimited job posts",
        "Advanced filters & search",
        "Talent pipeline CRM",
        "Team collaboration (5 seats)",
        "Priority support",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: null,
      desc: "For staffing agencies",
      features: [
        "Everything in Growth",
        "Unlimited seats",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
      ],
      highlight: false,
    },
  ];

  return (
    <SectionContainer id="pricing" narrow className="bg-gray-50 py-16 sm:py-24">
      <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
        Recruiter Plans
      </h2>
      <p className="mb-10 text-center text-lg text-gray-600 sm:mb-16 sm:text-xl">
        14-day free trial on all plans. No credit card required.
      </p>
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:items-center">
        {plans.map(({ name, price, desc, features, highlight }, i) => (
          <AnimateIn key={name} delay={i * 120} variant="scale-in">
            <div
              className={`rounded-2xl border-2 p-6 sm:p-8 ${highlight
                  ? "border-blue-600 bg-blue-600 text-white shadow-2xl lg:scale-105"
                  : "border-gray-200 bg-white"
                }`}
            >
            <h3
              className={`mb-1 text-xl font-semibold ${highlight ? "text-white" : "text-gray-900"
                }`}
            >
              {name}
            </h3>
            <p
              className={`mb-6 text-sm ${highlight ? "text-blue-100" : "text-gray-500"
                }`}
            >
              {desc}
            </p>
            <div className="mb-8">
              {price ? (
                <span
                  className={`text-4xl font-bold sm:text-5xl ${highlight ? "text-white" : "text-gray-900"
                    }`}
                >
                  ${price}
                  <span
                    className={`text-base font-normal ${highlight ? "text-blue-100" : "text-gray-500"
                      }`}
                  >
                    /mo
                  </span>
                </span>
              ) : (
                <span
                  className={`text-3xl font-bold ${highlight ? "text-white" : "text-gray-900"
                    }`}
                >
                  Custom
                </span>
              )}
            </div>
            <ul className="mb-8 space-y-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className={`flex items-center gap-2 text-sm ${highlight ? "text-white" : "text-gray-700"
                    }`}
                >
                  <CheckCircle
                    className={`h-4 w-4 shrink-0 ${highlight ? "text-blue-200" : "text-blue-600"
                      }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login?type=recruiter"
              className={`block rounded-xl py-3 text-center text-sm font-semibold transition-colors ${highlight
                  ? "bg-white text-blue-600 hover:bg-gray-100"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {price ? "Start Free Trial" : "Contact Sales"}
            </Link>
            </div>
          </AnimateIn>
        ))}
      </div>
    </SectionContainer>
  );
}

function RecruiterCTA() {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-blue-950 px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <AnimateIn className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
          Start Hiring Smarter Today
        </h2>
        <p className="mb-8 text-lg text-gray-300 sm:mb-10 sm:text-xl">
          Join 2,500+ recruiters who&apos;ve cut their time-to-hire in half with
          Vodora&apos;s verified talent pool.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/login?type=recruiter"
            className="rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-500 sm:text-lg"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login?type=recruiter"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:text-lg"
          >
            See Demo <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </AnimateIn>
    </section>
  );
}
