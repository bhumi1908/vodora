import { Briefcase, Building2, CheckCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";

export type AccountType = "candidate" | "recruiter";

interface SignupHeaderProps {
  accountType?: AccountType;
  variant?: "chooser" | "form";
}

export function SignupHeader({ accountType, variant = "form" }: SignupHeaderProps) {
  if (variant === "chooser") {
    return (
      <div className="mb-10 text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">Vodora</span>
        </Link>
        <h1 className="mb-2 text-3xl font-semibold text-gray-900 sm:text-4xl">
          Join Vodora
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Choose how you want to use Vodora
        </p>
      </div>
    );
  }

  const isRecruiter = accountType === "recruiter";

  return (
    <div className="mb-8 text-center">
      <Link
        href={isRecruiter ? "/recruiters" : "/"}
        className="mb-6 inline-flex items-center gap-2"
      >
        {isRecruiter ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-semibold text-gray-900">Vodora</span>
              <span className="text-xs font-medium tracking-wide text-blue-600 uppercase">
                For Recruiters
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-semibold text-gray-900">Vodora</span>
              <span className="text-xs font-medium tracking-wide text-blue-600 uppercase">
                For Candidates
              </span>
            </div>
          </>
        )}
      </Link>
      <h1 className="mb-2 text-3xl font-semibold text-gray-900 sm:text-4xl">
        {isRecruiter ? "Create Recruiter Account" : "Create Candidate Account"}
      </h1>
      <p className="text-sm text-gray-600 sm:text-base">
        {isRecruiter
          ? "Join the trusted hiring network"
          : "Build your portable professional reputation"}
      </p>
    </div>
  );
}

interface SignupRoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  href: string;
}

export function SignupRoleCard({
  icon: Icon,
  title,
  description,
  features,
  buttonText,
  href,
}: SignupRoleCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-600 hover:shadow-lg sm:p-8"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-colors duration-200 group-hover:bg-blue-600"
      >
        <Icon
          className="h-6 w-6 text-blue-600 transition-colors duration-200 group-hover:text-white"
        />
      </div>
      <h2 className="mb-1 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mb-6 text-sm text-gray-600">{description}</p>
      <ul className="mb-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
      <span
        className="mt-auto block w-full rounded-lg bg-blue-600 py-3 text-center text-base font-medium text-white transition-colors duration-200 group-hover:bg-blue-700"
      >
        {buttonText}
      </span>
    </Link>
  );
}

interface SignupFormShellProps {
  accountType: AccountType;
  children: React.ReactNode;
}

export function SignupFormShell({ accountType, children }: SignupFormShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <SignupHeader accountType={accountType} />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
