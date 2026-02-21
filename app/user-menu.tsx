"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-16 animate-pulse rounded-md bg-[var(--muted)]" />
    );
  }

  if (!session?.user) {
    return (
      <button
        className="min-h-[44px] rounded-md border border-[var(--foreground)] px-4 py-2 text-sm font-medium tracking-[0.05em] text-[var(--foreground)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        onClick={() => signIn("github")}
        type="button"
      >
        登录
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-200 hover:bg-[var(--muted)]"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {session.user.image ? (
          <Image
            alt={session.user.name ?? "User avatar"}
            className="h-7 w-7 rounded-full border border-[var(--border)] object-cover"
            height={28}
            src={session.user.image}
            unoptimized
            width={28}
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-xs font-medium text-[var(--foreground)]">
            {(session.user.name ?? "U").charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden text-sm text-[var(--foreground)] sm:inline">
          {session.user.name ?? "User"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-lg border border-[var(--border)] bg-white p-1 shadow-[0_4px_12px_rgba(26,26,26,0.06)]">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {session.user.name ?? "User"}
            </p>
          </div>
          <button
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-[var(--muted-foreground)] transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={() => signOut()}
            type="button"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
