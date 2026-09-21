import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/reception/overview", label: "Overview" },
  { href: "/reception/patients", label: "Patients" },
  { href: "/reception/queue", label: "Queue" },
  { href: "/reception/billing", label: "Billing" },
  { href: "/reception/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function ReceptionQueuePage() {
  const session = await requireSession(["reception"]);
  const snapshot = await getClinicSnapshot();
  const visits = snapshot.visits
    .filter((visit) => visit.status === "Waiting" || visit.status === "In Consultation")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <DashboardShell
      activeHref="/reception/queue"
      navItems={navItems}
      session={session}
      subtitle="See today's patient order and whether each patient is waiting or with the doctor."
      title="Reception dashboard"
    >
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-medium text-slate-500">Live queue</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {visits.length} active patient{visits.length === 1 ? "" : "s"}
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {visits.map((visit, index) => (
            <article className="flex items-center gap-4 px-6 py-5" key={visit.id}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{visit.patientName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {visit.patientCode} • {new Date(visit.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                visit.status === "In Consultation"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {visit.status === "In Consultation" ? "With doctor" : "Waiting"}
              </span>
            </article>
          ))}
          {!visits.length ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">The queue is empty.</p>
          ) : null}
        </div>
      </section>
    </DashboardShell>
  );
}
