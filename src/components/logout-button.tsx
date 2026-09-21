"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      aria-label="Logout"
      className={`flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60 ${
        compact ? "lg:justify-center lg:px-0" : "px-3"
      }`}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        });
      }}
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3M10 12h11m-3-3 3 3-3 3" />
      </svg>
      <span className={compact ? "lg:hidden" : ""}>{pending ? "Signing out..." : "Logout"}</span>
    </button>
  );
}
