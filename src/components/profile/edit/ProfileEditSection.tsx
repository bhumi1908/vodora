import type { ReactNode } from "react";

type ProfileEditSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function ProfileEditSection({
  id,
  title,
  description,
  children,
  footer,
}: ProfileEditSectionProps) {
  return (
    <section
      id={id}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        ) : null}
      </div>

      <div className="space-y-4">{children}</div>

      {footer ? (
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
