import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { demoClinicSnapshot } from "@/lib/demo-data";
import { getRoleHome, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHome(session.role));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f3f7f6_42%,#eef6ff_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="rounded-[36px] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
            Real Demo Login
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Clinic app demo with backend actions and role-based dashboards.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Sign in with one of the default demo accounts below. The app now has backend
            routes for login, patient registration, visit updates, medicine stock control,
            and receipt billing.
          </p>
          <div className="mt-8 grid gap-3">
            {demoClinicSnapshot.users.map((user) => (
              <div
                key={user.username}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{user.username}</p>
                    <p className="text-sm text-slate-500">Password: {user.password}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {user.role}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Screens: {user.screens.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Sign In
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Default demo access
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This session uses a demo cookie-based role login for testing app flow.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
