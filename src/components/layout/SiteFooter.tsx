import { Briefcase } from "lucide-react";
import Link from "next/link";

import { CANDIDATE_JOBS_PATH } from "@/lib/auth/routes";

interface FooterLink {
  label: string;
  href: string;
  className?: string;
  prefetch?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Candidates",
    links: [
      { label: "Create Profile", href: "/signup/candidate" },
      { label: "My Profile", href: "/my-profile" },
      { label: "Browse Jobs", href: CANDIDATE_JOBS_PATH, prefetch: false },
      { label: "Find Recruiters", href: "/recruiters" },
    ],
  },
  {
    title: "Recruiters",
    links: [
      { label: "Recruiter Login", href: "/recruiters" },
      { label: "Find Candidates", href: "/recruiters#features" },
      { label: "Create Recruiter Account", href: "/signup/recruiter" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact-us" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms-and-conditions" },
      {
        label: "Admin",
        href: "/admin",
        className: "text-gray-600 hover:text-white",
        prefetch: false,
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold text-white">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={link.prefetch}
                      className={`transition-colors hover:text-white ${link.className ?? ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
              <Briefcase className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-white">Vodora</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Vodora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
