import { Lock } from "lucide-react";

export function ProfileRestrictedNotice() {
  return (
    <div className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
      <p className="text-sm leading-relaxed text-gray-600">
        References, documents and job activity are private. Connect to request
        access to this candidate&apos;s verified reference profile.
      </p>
    </div>
  );
}
