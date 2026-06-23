import { ReferenceRespondPageClient } from "@/components/profile/reference/ReferenceRespondPageClient";
import { createClient } from "@/lib/supabase/server";

type ReferenceRespondPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ReferenceRespondPage({
  searchParams,
}: ReferenceRespondPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userEmail: string | null = null;

  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();

    userEmail = userRow?.email ?? user.email ?? null;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Missing invitation</h1>
        <p className="mt-3 text-sm text-gray-600">
          This page requires a valid invitation token from your email.
        </p>
      </div>
    );
  }

  return (
    <ReferenceRespondPageClient
      token={token}
      isAuthenticated={Boolean(user)}
      userEmail={userEmail}
    />
  );
}
