"use client";

import Link from "next/link";
import { useState } from "react";

import { LogoutButton } from "@/components/logout-button";
import type { AuthSession, DashboardNavItem } from "@/lib/types";

function NavIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase();

  if (normalized.includes("overview")) {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    );
  }

  if (normalized.includes("waiting") || normalized.includes("queue")) {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (normalized.includes("patient") || normalized.includes("history")) {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path strokeLinecap="round" d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5" />
        <path strokeLinecap="round" d="M15 6.5a3 3 0 0 1 0 5.5M16 14c2.5.3 4 2 4.5 4.5" />
      </svg>
    );
  }

  if (normalized.includes("billing")) {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path strokeLinecap="round" d="M9 8h6M9 12h6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 4.5a4.95 4.95 0 0 1 7 7l-4 4a4.95 4.95 0 0 1-7-7l4-4Z" />
      <path strokeLinecap="round" d="m8 12 4 4" />
    </svg>
  );
}

export function DashboardShell({
  session,
  title,
  subtitle,
  navItems,
  activeHref,
  children,
}: {
  session: AuthSession;
  title: string;
  subtitle: string;
  navItems: DashboardNavItem[];
  activeHref: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const activeItem = navItems.find((item) => item.href === activeHref) ?? navItems[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f3f7f6_42%,#eef6ff_100%)] text-slate-900">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div className={`grid gap-5 transition-[grid-template-columns] duration-300 ${
          collapsed
            ? "lg:grid-cols-[88px_minmax(0,1fr)]"
            : "lg:grid-cols-[280px_minmax(0,1fr)]"
        }`}>
          <aside className={`rounded-3xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-300/50 transition-all duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] ${
            collapsed ? "lg:px-3" : ""
          }`}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex min-w-0 items-center gap-3 ${collapsed ? "lg:hidden" : ""}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-white">
                    C
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">Clinic</p>
                    <p className="truncate text-xs capitalize text-slate-400">{session.role} portal</p>
                  </div>
                </div>
                <button
                  aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
                  className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:flex ${
                    collapsed ? "mx-auto" : ""
                  }`}
                  onClick={() => setCollapsed((current) => !current)}
                  title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
                  type="button"
                >
                  <svg aria-hidden="true" className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              </div>

              <div className={`mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="truncate text-xs text-slate-400">Signed in as</p>
                <p className="mt-1 truncate text-sm font-semibold text-white">{session.username}</p>
              </div>

              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = item.href === activeHref;

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border text-sm font-medium transition ${
                        collapsed ? "lg:justify-center lg:px-0" : "px-3"
                      } ${
                        active
                          ? "border-white bg-white text-slate-950 shadow-sm"
                          : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                      href={item.href}
                      key={item.href}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="shrink-0"><NavIcon label={item.label} /></span>
                      <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-wrap gap-2 pt-6 lg:flex-col">
                <Link
                  className={`flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10 ${
                    collapsed ? "lg:justify-center lg:px-0" : "px-3"
                  }`}
                  href="/"
                  title={collapsed ? "Home" : undefined}
                >
                  <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z" />
                  </svg>
                  <span className={collapsed ? "lg:hidden" : ""}>Home</span>
                </Link>
                <LogoutButton compact={collapsed} />
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <header className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-6 shadow-lg shadow-slate-200/60 backdrop-blur">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                {activeItem?.label ?? title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{subtitle}</p>
            </header>

            <div className="mt-6 flex flex-col gap-6">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
