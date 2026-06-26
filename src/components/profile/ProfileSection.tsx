import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ProfileSectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ProfileSection({
  title,
  icon: Icon,
  children,
  action,
  className = "",
}: ProfileSectionProps) {
  return (
    <div
      className={`mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-blue-600" />
          <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
        {action ? (
          <div className="shrink-0 self-start sm:self-auto">{action}</div>
        ) : null}
      </div>
      <div className="px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}
