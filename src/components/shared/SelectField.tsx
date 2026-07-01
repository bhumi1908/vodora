"use client";

import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type SelectOption = { value: string; label: string };

export type SelectOptionGroup = {
  label: string;
  options: readonly SelectOption[];
};

type SelectSize = "default" | "compact" | "comfortable";

type CustomSelectProps = {
  id?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options?: readonly SelectOption[];
  optionGroups?: readonly SelectOptionGroup[];
  placeholder?: string;
  allowEmpty?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: SelectSize;
  rounded?: "lg" | "xl";
  className?: string;
  rightAdornment?: ReactNode;
  "aria-invalid"?: boolean;
  "aria-busy"?: boolean;
  "aria-labelledby"?: string;
};

const SIZE_CLASSNAME: Record<SelectSize, string> = {
  default: "py-3 pl-4 text-base sm:text-sm",
  compact: "py-2 pl-3 text-sm",
  comfortable: "py-2.5 pl-4 text-sm",
};

const MENU_SIZE_CLASSNAME: Record<SelectSize, string> = {
  default: "px-4 py-2.5 text-base sm:text-sm",
  compact: "px-3 py-2 text-sm",
  comfortable: "px-3 py-2.5 text-sm",
};

const ROUNDED_CLASSNAME = {
  lg: "rounded-lg",
  xl: "rounded-xl",
} as const;

function createSelectChangeEvent(value: string): ChangeEvent<HTMLSelectElement> {
  return {
    target: { value } as HTMLSelectElement,
    currentTarget: { value } as HTMLSelectElement,
  } as ChangeEvent<HTMLSelectElement>;
}

function flattenOptions(
  options?: readonly SelectOption[],
  optionGroups?: readonly SelectOptionGroup[],
): SelectOption[] {
  if (optionGroups?.length) {
    return optionGroups.flatMap((group) => [...group.options]);
  }

  return [...(options ?? [])];
}

function getTriggerLabel(
  value: string,
  placeholder: string,
  allowEmpty: boolean,
  flatOptions: SelectOption[],
): string {
  if (!value) {
    return allowEmpty ? placeholder : flatOptions[0]?.label ?? placeholder;
  }

  return flatOptions.find((option) => option.value === value)?.label ?? value;
}

function isPlaceholderValue(value: string, allowEmpty: boolean): boolean {
  return allowEmpty && !value;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  optionGroups,
  placeholder = "Select",
  allowEmpty = true,
  required = false,
  disabled = false,
  error,
  size = "default",
  rounded = "lg",
  className = "",
  rightAdornment,
  "aria-invalid": ariaInvalid,
  "aria-busy": ariaBusy,
  "aria-labelledby": ariaLabelledBy,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const flatOptions = useMemo(
    () => flattenOptions(options, optionGroups),
    [options, optionGroups],
  );

  const menuOptions = useMemo(() => {
    if (!allowEmpty) {
      return flatOptions;
    }

    return [{ value: "", label: placeholder }, ...flatOptions];
  }, [allowEmpty, flatOptions, placeholder]);

  const triggerLabel = getTriggerLabel(value, placeholder, allowEmpty, flatOptions);
  const showPlaceholderStyle = isPlaceholderValue(value, allowEmpty);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectValue = useCallback(
    (nextValue: string) => {
      onChange(createSelectChangeEvent(nextValue));
      closeMenu();
    },
    [closeMenu, onChange],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function handleScroll() {
      closeMenu();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [closeMenu, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedIndex = menuOptions.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    listboxRef.current?.focus();
  }, [isOpen, menuOptions, value]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, menuOptions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = menuOptions[activeIndex];
      if (option) {
        selectValue(option.value);
      }
    }
  }

  const optionClassName = `mx-1 block w-[calc(100%-0.5rem)] rounded-md text-left transition-colors ${MENU_SIZE_CLASSNAME[size]}`;

  const triggerBorderClassName = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : isOpen
      ? "border-blue-400 ring-2 ring-blue-500"
      : "border-gray-300 focus:border-transparent focus:ring-2 focus:ring-blue-500";

  const disabledClassName = disabled
    ? "cursor-not-allowed bg-gray-50 text-gray-500"
    : "bg-white text-gray-900";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-invalid={ariaInvalid}
        aria-busy={ariaBusy}
        aria-labelledby={ariaLabelledBy}
        aria-required={required || undefined}
        onClick={() => {
          if (!disabled) {
            setIsOpen((current) => !current);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-2 border pr-10 text-left outline-none transition-colors ${SIZE_CLASSNAME[size]} ${ROUNDED_CLASSNAME[rounded]} ${triggerBorderClassName} ${disabledClassName} ${showPlaceholderStyle && !disabled ? "text-gray-400" : ""}`}
      >
        <span className="min-w-0 truncate">{triggerLabel}</span>
      </button>

      {rightAdornment ?? (
        <ChevronDown
          className={`pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      )}

      {isOpen ? (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          aria-labelledby={selectId}
          tabIndex={-1}
          onKeyDown={handleListboxKeyDown}
          className={`absolute z-30 mt-1 max-h-60 w-full overflow-auto border border-gray-200 bg-white py-1 shadow-lg ${ROUNDED_CLASSNAME[rounded]}`}
        >
          {allowEmpty ? (
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onMouseEnter={() => setActiveIndex(0)}
                onClick={() => selectValue("")}
                className={`${optionClassName} ${
                  activeIndex === 0
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-400 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {placeholder}
              </button>
            </li>
          ) : null}

          {optionGroups?.length
            ? optionGroups.map((group) => (
                <li key={group.label} role="presentation">
                  <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    {group.label}
                  </p>
                  <ul role="group" aria-label={group.label}>
                    {group.options.map((option) => {
                      const optionIndex = menuOptions.findIndex(
                        (menuOption) => menuOption.value === option.value,
                      );
                      const isSelected = value === option.value;
                      const isActive = activeIndex === optionIndex;

                      return (
                        <li key={option.value} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setActiveIndex(optionIndex)}
                            onClick={() => selectValue(option.value)}
                            className={`${optionClassName} ${
                              isActive || isSelected
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                          >
                            {option.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))
            : flatOptions.map((option, index) => {
                const optionIndex = allowEmpty ? index + 1 : index;
                const isSelected = value === option.value;
                const isActive = activeIndex === optionIndex;

                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(optionIndex)}
                      onClick={() => selectValue(option.value)}
                      className={`${optionClassName} ${
                        isActive || isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-900 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
        </ul>
      ) : null}
    </div>
  );
}

/** @deprecated Use CustomSelect instead. Kept for gradual migration. */
export const SELECT_RIGHT_PADDING_CLASSNAME = "pr-10";

/** @deprecated Use CustomSelect instead. */
export const SELECT_FIELD_FOCUS_CLASSNAME =
  "focus:border-transparent focus:ring-2 focus:ring-blue-500";

/** @deprecated Use CustomSelect instead. */
export function getSelectFieldClassName(error?: string) {
  const baseClassName = `w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-4 ${SELECT_RIGHT_PADDING_CLASSNAME} text-base outline-none transition-colors ${SELECT_FIELD_FOCUS_CLASSNAME} sm:text-sm`;

  if (error) {
    return `${baseClassName} border-red-500 focus:ring-red-500`;
  }

  return baseClassName;
}

/** @deprecated Use CustomSelect instead. */
export function SelectField({
  children,
  rightAdornment,
}: {
  children: ReactNode;
  rightAdornment?: ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {rightAdornment ?? (
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      )}
    </div>
  );
}
