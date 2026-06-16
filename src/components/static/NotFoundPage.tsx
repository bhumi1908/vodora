import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-lg text-center">
        <p className="mb-3 text-7xl font-bold tracking-tight text-transparent bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text sm:text-8xl">
          404
        </p>
        <h1 className="mb-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-600 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Check the URL or head back to a known page.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-6"
          >
            <Home className="h-4 w-4 shrink-0" />
            Back to home
          </Link>
          <Link
            href="/#candidates"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 sm:px-6"
          >
            <Search className="h-4 w-4 shrink-0" />
            Explore candidates
          </Link>
        </div>

        <Link
          href="/contact-us"
          className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Contact support
        </Link>
      </div>
    </div>
  );
}
