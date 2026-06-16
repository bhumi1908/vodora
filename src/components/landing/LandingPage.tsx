"use client";

import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  Shield,
  Share2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { FaqAccordion } from "@/components/landing/shared/FaqAccordion";
import { AnimateIn } from "@/components/landing/shared/AnimateIn";

const candidateFaqs = [
  {
    q: "How does Vodora verify references?",
    a: "We verify references through corporate email validation, manager verification, and relationship confirmation. Each reference is authenticated once and stored securely.",
  },
  {
    q: "Is Vodora free for candidates?",
    a: "Yes, creating a professional profile and collecting references is completely free for candidates. You own your data and can use it forever.",
  },
  {
    q: "How is Vodora different from LinkedIn?",
    a: "Vodora is a professional trust infrastructure, not a social network. We focus on verified employment history, authenticated references, and portable professional reputation.",
  },
  {
    q: "Can I control who sees my references?",
    a: "Absolutely. You have complete control over who can view your references and profile. Share on your terms with permission-based access.",
  },
  {
    q: "Do recruiters pay to use Vodora?",
    a: "Recruiters have access to a powerful suite of search and hiring tools. Contact us for recruiter account options.",
  },
  {
    q: "How long do references stay on my profile?",
    a: "Forever. Once a reference is verified and added to your Vodora profile, it stays with you throughout your career. You own your professional reputation.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Problem />
      <HowItWorks />
      <TrustLayer />
      <ForCandidates />
      <ForRecruiters />
      <PortableTrust />
      {/* <ProfessionalCategories /> */}
      <WorkYourWay />
      {/* <SocialProof /> */}
      <SecurityPrivacy />
      <FaqAccordion
        items={candidateFaqs}
        title="Frequently Asked Questions"
      />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <AnimateIn immediate variant="fade-up">
          <div>
            <h1 className="mb-6 text-4xl leading-tight font-semibold text-gray-900 sm:text-5xl lg:text-6xl">
              Own Your Professional Reputation
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Build a verified professional profile with reusable references,
              employment history and trust signals that you control and share with
              recruiters, employers and clients.
            </p>
            <div className="flex flex-col gap-4">
              <Link
                href="/signup/candidate"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <Users className="h-5 w-5" />
                Create a Candidate Profile
              </Link>
              <Link
                href="/recruiters"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                <Building2 className="h-5 w-5" />
                Login as a Recruiter
              </Link>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn immediate delay={150} variant="fade-up" className="relative">
          <div className="animate-float rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-xl sm:p-8">
            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-16 sm:w-16">
                  <span className="text-xl font-semibold text-blue-700 sm:text-2xl">
                    SJ
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                  <p className="text-sm text-gray-600">
                    Senior Software Engineer
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      <Shield className="h-3 w-3" />8 References
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  "Employment Verified",
                  "Identity Verified",
                  "Email Verified",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{label}</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-500">
                Trusted by recruiters at
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>Tech Corp</span>
                <span className="hidden sm:inline">•</span>
                <span>Hiring Co</span>
                <span className="hidden sm:inline">•</span>
                <span>Staffing Pro</span>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Problem() {
  const candidatePain = [
    "Repeatedly provide the same references",
    "No ownership of reputation",
    "Managers receive endless calls",
    "References disappear between recruiters",
  ];

  const recruiterPain = [
    "Manual reference checking",
    "Time wasted chasing referees",
    "Duplicate verification work",
    "Limited trust signals",
  ];

  return (
    <section className="bg-gray-50 py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 sm:mb-16 sm:text-4xl lg:text-5xl">
            Hiring Trust Is Broken
          </h2>
        </AnimateIn>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-12">
          <AnimateIn delay={100}>
            <PainCard title="Candidate Pain" items={candidatePain} />
          </AnimateIn>
          <AnimateIn delay={200}>
            <PainCard title="Recruiter Pain" items={recruiterPain} />
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

function PainCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <h3 className="mb-6 text-xl font-semibold text-gray-900 sm:text-2xl">
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-gray-700">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
              <span className="text-sm text-red-600">✕</span>
            </div>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Users, title: "Create Profile", desc: "Build your professional profile" },
    {
      icon: Briefcase,
      title: "Add Employment History",
      desc: "Document your work experience",
    },
    {
      icon: Mail,
      title: "Request Verified References",
      desc: "Ask managers for references",
    },
    {
      icon: Shield,
      title: "Build Trust Profile",
      desc: "Accumulate verifications",
    },
    {
      icon: Share2,
      title: "Share Anywhere",
      desc: "One-click sharing with recruiters",
    },
  ];

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 sm:mb-16 sm:text-4xl lg:text-5xl">
            How Vodora Works
          </h2>
        </AnimateIn>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:flex lg:items-start lg:justify-between lg:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <AnimateIn key={step.title} delay={i * 100} className="relative flex flex-col items-center lg:flex-1">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 sm:h-20 sm:w-20">
                    <Icon className="h-8 w-8 text-blue-600 sm:h-10 sm:w-10" />
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute top-1/2 -right-8 hidden h-6 w-6 -translate-y-1/2 text-gray-300 lg:block" />
                  )}
                </div>
                <h3 className="mb-2 text-center font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-center text-sm text-gray-600">{step.desc}</p>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustLayer() {
  const layers = [
    {
      title: "Candidate Verification",
      items: ["Email Verified", "Identity Verified", "Employment Verified"],
    },
    {
      title: "Reference Verification",
      items: [
        "Corporate Email Verified",
        "Manager Verified",
        "Relationship Verified",
      ],
    },
    {
      title: "Recruiter Verification",
      items: [
        "Company Verified",
        "Professional Email Verified",
        "Business Registered",
      ],
    },
  ];

  return (
    <section id="features" className="bg-gradient-to-br from-blue-50 to-white py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 sm:mb-16 sm:text-4xl lg:text-5xl">
            Multi-Layer Verification
          </h2>
        </AnimateIn>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {layers.map((layer, i) => (
            <AnimateIn key={layer.title} delay={i * 120}>
              <div className="rounded-xl border-2 border-blue-200 bg-white p-6 sm:p-8">
                <h3 className="mb-6 text-lg font-semibold text-gray-900 sm:text-xl">
                  {layer.title}
                </h3>
                <div className="space-y-4">
                  {layer.items.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForCandidates() {
  const benefits = [
    "Control your professional reputation",
    "Reuse references forever",
    "Build credibility over time",
    "Share one profile everywhere",
    "Stand out to recruiters",
  ];

  return (
    <section id="candidates" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimateIn variant="fade-left">
            <div>
              <h2 className="mb-6 text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
                Own Your References
              </h2>
              <ul className="mb-8 space-y-4">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 text-base text-gray-700 sm:text-lg"
                  >
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-blue-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup/candidate"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <Users className="h-5 w-5" />
                Create a Candidate Profile
              </Link>
            </div>
          </AnimateIn>
          <AnimateIn delay={150} variant="fade-right">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8">
              <div className="flex aspect-square items-center justify-center">
                <div className="text-center">
                  <Shield className="mx-auto mb-4 h-24 w-24 text-blue-600 sm:h-32 sm:w-32" />
                  <p className="text-gray-600">Your reputation, your control</p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

function ForRecruiters() {
  const features = [
    "Candidate Search",
    "Skills Filtering",
    "Country & City Search",
    "Availability Search",
    "Endorsement Search",
    "Trust Indicators",
    "Job Posting",
    "Talent Pipeline",
  ];

  return (
    <section id="recruiters" className="bg-gray-50 py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-4 text-center text-3xl font-semibold text-gray-900 sm:mb-6 sm:text-4xl lg:text-5xl">
            Hire Faster. Verify Less.
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-gray-600 sm:mb-12 sm:text-xl">
            Access pre-verified candidates with trusted references and save weeks
            in the hiring process
          </p>
        </AnimateIn>
        <AnimateIn delay={120}>
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
        <AnimateIn delay={220} className="text-center">
          <Link
            href="/recruiters"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            <Building2 className="h-5 w-5" />
            Login as a Recruiter
          </Link>
        </AnimateIn>
      </div>
    </section>
  );
}

function PortableTrust() {
  const steps = [
    { icon: Users, title: "Manager", desc: "Provides Reference" },
    { icon: Shield, title: "Verification", desc: "Vodora Validates" },
    { icon: Award, title: "Trust Record", desc: "Stored Forever" },
    {
      icon: Building2,
      title: "Multiple Recruiters",
      desc: "Share Instantly",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-10 text-center text-3xl font-semibold sm:mb-16 sm:text-4xl lg:text-5xl">
            References Verified Once. Used Forever.
          </h2>
        </AnimateIn>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-6 lg:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <AnimateIn
                key={step.title}
                delay={i * 100}
                className="flex flex-col items-center sm:flex-row"
              >
                <div className="rounded-xl bg-white/10 p-5 text-center backdrop-blur sm:min-w-[140px] sm:p-6">
                  <Icon className="mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12" />
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-blue-100">{step.desc}</p>
                </div>
                {i < steps.length - 1 ? (
                  <ArrowRight className="my-2 h-6 w-6 shrink-0 rotate-90 text-blue-200 sm:mx-3 sm:my-0 sm:h-8 sm:w-8 sm:rotate-0" />
                ) : null}
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProfessionalCategories() {
  const categories = [
    "Accounting & Finance",
    "Technology",
    "Engineering",
    "Healthcare",
    "Construction",
    "Trades & Services",
    "Marketing",
    "Creative & Design",
    "Human Resources",
    "Manufacturing & Logistics",
    "Labour Hire",
    "Freelance Professionals",
  ];

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 sm:mb-16 sm:text-4xl lg:text-5xl">
          Professional Categories
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category}
              className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-4 text-center transition-all hover:border-blue-500 hover:shadow-lg sm:p-6"
            >
              <Briefcase className="mx-auto mb-2 h-7 w-7 text-blue-600 sm:h-8 sm:w-8" />
              <p className="text-sm font-medium text-gray-900 sm:text-base">
                {category}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkYourWay() {
  const workTypes = [
    "Full Time",
    "Part Time",
    "Contract",
    "Freelance",
    "Labour Hire",
    "Casual",
    "Remote",
    "FIFO",
    "Temporary",
  ];

  return (
    <section className="bg-gray-50 py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 text-center sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-4 text-3xl font-semibold text-gray-900 sm:mb-6 sm:text-4xl lg:text-5xl">
            One Profile. Every Work Style.
          </h2>
          <p className="mb-10 text-lg text-gray-600 sm:mb-12 sm:text-xl">
            Whether you&apos;re local or international, full-time or freelance
          </p>
        </AnimateIn>
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {workTypes.map((type, i) => (
            <AnimateIn key={type} delay={i * 50} variant="scale-in">
              <span className="inline-block cursor-pointer rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-blue-500 sm:px-6 sm:py-3">
                {type}
              </span>
            </AnimateIn>
          ))}
        </div>
        <AnimateIn delay={200}>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup/candidate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Users className="h-5 w-5" />
              Create a Candidate Profile
            </Link>
            <Link
              href="/recruiters"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <Building2 className="h-5 w-5" />
              Login as a Recruiter
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function SocialProof() {
  const metrics = [
    { value: "50,000+", label: "Profiles Created" },
    { value: "150,000+", label: "References Verified" },
    { value: "2,500+", label: "Recruiters Registered" },
    { value: "45+", label: "Countries Represented" },
  ];

  return (
    <section id="about" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600 sm:text-4xl lg:text-5xl">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600 sm:text-base">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecurityPrivacy() {
  const features = [
    { icon: Lock, title: "Visibility Controls", desc: "Choose who sees your profile" },
    {
      icon: Shield,
      title: "Permission-Based Sharing",
      desc: "You decide who to share with",
    },
    {
      icon: CheckCircle,
      title: "Secure Verification",
      desc: "Bank-level encryption",
    },
    {
      icon: Users,
      title: "Privacy Controls",
      desc: "Granular privacy settings",
    },
    { icon: FileText, title: "Data Protection", desc: "GDPR compliant" },
  ];

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 sm:mb-16 sm:text-4xl lg:text-5xl">
            You Control Your Professional Data
          </h2>
        </AnimateIn>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <AnimateIn key={feature.title} delay={i * 80} variant="scale-in">
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                  <Icon className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 text-center sm:px-6 lg:px-8">
        <AnimateIn variant="fade-up">
          <h2 className="mb-4 text-3xl font-semibold sm:mb-6 sm:text-4xl lg:text-6xl">
            Your Reputation Should Belong To You
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100 sm:mb-10 sm:text-xl">
            Build a verified professional profile and carry your professional
            trust wherever your career takes you.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="/signup/candidate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-semibold text-blue-600 transition-colors hover:bg-gray-100"
            >
              <Users className="h-5 w-5" />
              Create a Candidate Profile
            </Link>
            <Link
              href="/recruiters"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-400"
            >
              <Building2 className="h-5 w-5" />
              Login as a Recruiter
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
