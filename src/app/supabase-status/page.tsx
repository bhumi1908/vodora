import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { checkSupabaseConnection } from "@/lib/supabase/check-connection";

export const dynamic = "force-dynamic";

export default async function SupabaseStatusPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const result = await checkSupabaseConnection();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
          Connection test
        </p>
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">
          Supabase × Next.js
        </h1>

        <div
          className={`mb-6 rounded-xl border px-4 py-3 ${
            result.ok
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-semibold">
            {result.ok ? "Connected" : "Not connected"}
          </p>
          <p className="mt-1 text-sm">{result.message}</p>
        </div>

        <dl className="space-y-3 text-sm text-gray-700">
          <div>
            <dt className="font-medium text-gray-500">Project URL</dt>
            <dd className="mt-0.5 break-all font-mono text-xs">{result.projectUrl}</dd>
          </div>
          {result.details ? (
            <div>
              <dt className="font-medium text-gray-500">Details</dt>
              <dd className="mt-0.5">{result.details}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 text-xs text-gray-500">
          This page queries a dummy table name on purpose. Supabase returns
          &quot;table not found&quot; when your URL and anon key are correct — no
          database tables are required.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
