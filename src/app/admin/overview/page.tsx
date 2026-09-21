import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";
import type { Visit } from "@/lib/types";

const navItems = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/stock", label: "Medicine Stocks" },
];

const LOW_STOCK_LIMIT = 20;

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function buildPeriodSummary(visits: Visit[], start: Date) {
  const periodVisits = visits.filter((visit) => new Date(visit.createdAt) >= start);
  const completedBills = visits.filter((visit) => {
    if (visit.status !== "Completed") {
      return false;
    }

    return new Date(visit.receiptIssuedAt ?? visit.createdAt) >= start;
  });

  return {
    visits: periodVisits.length,
    patients: new Set(periodVisits.map((visit) => visit.patientId)).size,
    completed: completedBills.length,
    medicineUnits: completedBills.reduce(
      (sum, visit) =>
        sum + visit.prescription.reduce((visitSum, item) => visitSum + item.quantity, 0),
      0,
    ),
    revenue: completedBills.reduce((sum, visit) => sum + visit.totalCharge, 0),
  };
}

export default async function AdminOverviewPage() {
  const session = await requireSession(["admin"]);
  const snapshot = await getClinicSnapshot();
  const now = new Date();
  const weekStart = startOfDay(now);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = startOfDay(now);
  monthStart.setDate(1);

  const periods = [
    {
      label: "Daily",
      detail: "Today",
      summary: buildPeriodSummary(snapshot.visits, startOfDay(now)),
      accent: "border-sky-200 bg-sky-50/70",
    },
    {
      label: "Weekly",
      detail: "Last 7 days",
      summary: buildPeriodSummary(snapshot.visits, weekStart),
      accent: "border-emerald-200 bg-emerald-50/70",
    },
    {
      label: "Monthly",
      detail: "Current month",
      summary: buildPeriodSummary(snapshot.visits, monthStart),
      accent: "border-amber-200 bg-amber-50/70",
    },
  ];

  const lowStockMedicines = snapshot.medicines
    .filter((medicine) => medicine.stock <= LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock - b.stock);
  const totalStock = snapshot.medicines.reduce((sum, medicine) => sum + medicine.stock, 0);
  const waitingCount = snapshot.visits.filter((visit) => visit.status === "Waiting").length;
  const consultingCount = snapshot.visits.filter(
    (visit) => visit.status === "In Consultation",
  ).length;
  const billingCount = snapshot.visits.filter(
    (visit) => visit.status === "Ready for Billing",
  ).length;

  return (
    <DashboardShell
      activeHref="/admin/overview"
      navItems={navItems}
      session={session}
      subtitle="Daily, weekly, and monthly clinic activity with live stock reminders."
      title="Admin dashboard"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100" href="/admin/patients">
          <p className="text-sm font-medium text-slate-500">Registered patients</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {snapshot.patients.length}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>Total patient records</span>
            <span className="font-semibold text-sky-700">View patients →</span>
          </div>
        </Link>
        <Link className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100" href="/admin/stock">
          <p className="text-sm font-medium text-slate-500">Medicines</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {snapshot.medicines.length}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>Medicine types in inventory</span>
            <span className="font-semibold text-sky-700">Manage →</span>
          </div>
        </Link>
        <Link className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100" href="/admin/stock">
          <p className="text-sm font-medium text-slate-500">Current stock</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {totalStock.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>Combined units available</span>
            <span className="font-semibold text-sky-700">View stock →</span>
          </div>
        </Link>
        <Link href="/admin/stock?view=low" className={`group rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-100 ${
          lowStockMedicines.length
            ? "border-rose-200 bg-rose-50 shadow-rose-100/70"
            : "border-emerald-200 bg-emerald-50 shadow-emerald-100/70"
        }`}>
          <p className="text-sm font-medium text-slate-600">Stock reminders</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${
            lowStockMedicines.length ? "text-rose-700" : "text-emerald-700"
          }`}>
            {lowStockMedicines.length}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-600">
            <span>{lowStockMedicines.length ? `At or below ${LOW_STOCK_LIMIT} units` : "All stock levels are healthy"}</span>
            <span className="font-semibold text-rose-700">Review →</span>
          </div>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Clinic activity</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Daily, weekly, monthly
            </h3>
          </div>
          <p className="text-sm text-slate-500">Updated {now.toLocaleString()}</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {periods.map(({ label, detail, summary, accent }) => (
            <article className={`rounded-[28px] border p-5 ${accent}`} key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{label}</p>
                  <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                  {summary.completed} paid
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Patients</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.patients}</p>
                  <p className="mt-1 text-xs text-slate-500">{summary.visits} visits</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Medicine</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.medicineUnits}</p>
                  <p className="mt-1 text-xs text-slate-500">units issued</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-slate-950 px-4 py-4 text-white">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Revenue</p>
                <p className="mt-2 text-xl font-semibold">{summary.revenue.toLocaleString()} MMK</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">Live workflow</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Patients right now
          </h3>
          <div className="mt-5 grid gap-3">
            {[
              ["Waiting", waitingCount, "bg-amber-100 text-amber-800"],
              ["With doctor", consultingCount, "bg-sky-100 text-sky-800"],
              ["Ready for billing", billingCount, "bg-emerald-100 text-emerald-800"],
            ].map(([label, value, color]) => (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4" key={label}>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
            <div>
              <p className="text-sm font-medium text-slate-500">Reminder</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Low medicine stock
              </h3>
            </div>
            <Link className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white" href="/admin/stock">
              Manage stock
            </Link>
          </div>
          {lowStockMedicines.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Medicine</th>
                    <th className="px-4 py-4 font-semibold">Current</th>
                    <th className="px-4 py-4 font-semibold">Limit</th>
                    <th className="px-6 py-4 font-semibold">Reminder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lowStockMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-950">{medicine.name}</p>
                        <p className="mt-1 text-xs text-slate-500">Expires {medicine.expiry}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-rose-700">
                        {medicine.stock} {medicine.unit}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{LOW_STOCK_LIMIT}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          medicine.stock === 0
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {medicine.stock === 0 ? "Out of stock" : "Restock soon"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-12 text-center text-sm text-slate-500">
              No low-stock reminders. Every medicine is above {LOW_STOCK_LIMIT} units.
            </p>
          )}
        </article>
      </section>
    </DashboardShell>
  );
}
