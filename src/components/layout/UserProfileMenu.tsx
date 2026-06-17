"use client";

import type { User } from "@supabase/supabase-js";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function getDisplayName(user: User): string {
  const firstName =
    typeof user.user_metadata?.first_name === "string"
      ? user.user_metadata.first_name.trim()
      : "";
  const lastName =
    typeof user.user_metadata?.last_name === "string"
      ? user.user_metadata.last_name.trim()
      : "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return user.email?.split("@")[0] ?? "Account";
}

function getInitials(user: User): string {
  const displayName = getDisplayName(user);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

type UserProfileMenuProps = {
  user: User;
  onSignOut?: () => void;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function UserProfileMenu({
  user,
  onSignOut,
  variant = "desktop",
  onNavigate,
}: UserProfileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleSignOut() {
    setIsSigningOut(true);
    setOpen(false);
    onNavigate?.();

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onSignOut?.();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  if (variant === "mobile") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {getInitials(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {getDisplayName(user)}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <Link
          href="/my-profile"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          onClick={onNavigate}
        >
          <UserRound className="h-4 w-4" />
          My Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          onClick={onNavigate}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          type="button"
          disabled={isSigningOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
          {getInitials(user)}
        </div>
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 lg:inline">
          {getDisplayName(user)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-gray-900">
              {getDisplayName(user)}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>

          <Link
            href="/my-profile"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            <UserRound className="h-4 w-4" />
            My Profile
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}