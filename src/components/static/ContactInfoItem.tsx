import type { LucideIcon } from "lucide-react";

interface ContactInfoItemProps {
  icon: LucideIcon;
  title: string;
  lines: string[];
}

export function ContactInfoItem({
  icon: Icon,
  title,
  lines,
}: ContactInfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
        {lines.map((line) => (
          <p key={line} className="text-gray-600">{line}</p>
        ))}
      </div>
    </div>
  );
}
