import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export const SELECT_CHEVRON_CLASSNAME =
  "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400";

/** Right padding reserved for the custom chevron on native selects. */
export const SELECT_RIGHT_PADDING_CLASSNAME = "pr-10";

type SelectFieldProps = {
  children: ReactNode;
  rightAdornment?: ReactNode;
};

export function SelectField({ children, rightAdornment }: SelectFieldProps) {
  return (
    <div className="relative">
      {children}
      {rightAdornment ?? (
        <ChevronDown className={SELECT_CHEVRON_CLASSNAME} aria-hidden />
      )}
    </div>
  );
}
