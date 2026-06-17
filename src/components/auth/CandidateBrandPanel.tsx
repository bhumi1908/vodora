import { Briefcase, CheckCircle } from "lucide-react";
import Link from "next/link";

const verificationBadges = [
  "Identity Verified",
  "Employment Verified",
  "Reference Verified",
  "Recruiter Trusted",
];

export function CandidateBrandPanel() {
  return (
    <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white lg:flex lg:w-1/2 lg:p-12">
      <div>
        <Link href="/" className="mb-12 flex items-center gap-2 lg:mb-16">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-white">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-2xl font-semibold">Vodora</span>
        </Link>

        <div className="max-w-lg">
          <h1 className="mb-4 text-3xl font-semibold leading-tight lg:mb-6 lg:text-5xl">
            Trusted Hiring, Built on Verification
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-blue-100 lg:mb-12 lg:text-xl">
            Whether you&apos;re building your career or finding your next hire,
            Vodora connects verified professionals with trusted recruiters.
          </p>

          <div className="mb-8 space-y-3 lg:mb-12 lg:space-y-4">
            {verificationBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-blue-200" />
                <span className="text-base lg:text-lg">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white/10 p-5 backdrop-blur lg:p-6">
        <div className="mb-3 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <span className="text-xl font-semibold">SJ</span>
          </div>
          <div>
            <div className="font-semibold">Sarah Johnson</div>
            <div className="text-sm text-blue-100">Senior Engineer</div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-blue-100">
          &ldquo;Vodora helped me carry my professional reputation across 3 jobs.
          My references are verified once and trusted everywhere.&rdquo;
        </p>
      </div>
    </div>
  );
}
