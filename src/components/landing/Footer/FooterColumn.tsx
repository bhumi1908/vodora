import Link from "next/link";

import type { FooterColumnConfig } from "./constants";

interface FooterColumnProps {
  readonly column: FooterColumnConfig;
}

export function FooterColumn({ column }: FooterColumnProps) {
  return (
    <nav aria-label={column.title} >
      <ul className="flex flex-col gap-3 sm:gap-4">
        <li>
          <span className="text-sm font-normal text-white sm:text-base">
            {column.title}
          </span>
        </li>
        {column.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              prefetch={link.prefetch}
              className="text-sm font-normal text-white transition-opacity hover:opacity-80 sm:text-base"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
