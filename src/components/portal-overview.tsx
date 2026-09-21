import Link from "next/link";

import type { ClinicSnapshot, Visit } from "@/lib/types";

const LOW_STOCK_LIMIT = 20;

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function summarize(visits: Visit[], start: Date) {
  const periodVisits = visits.filter((visit) => new Date(visit.createdAt) >= start);
  const paidVisits = visits.filter(
    (visit) =>
      visit.status === "Completed" &&
      new Date(visit.receiptIssuedAt ?? visit.createdAt) >= start,
  );

  return {
    visits: periodVisits.length,
    patients: new Set(periodVisits.map((visit) => visit.patientId)).size,
    completed: paidVisits.length,
    medicineUnits: paidVisits.reduce(
      (sum, visit) =>
        sum + visit.prescription.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    ),
    revenue: paidVisits.reduce((sum, visit) => sum + visit.totalCharge, 0),
  };
}

export function PortalOverview({
  role,
  snapshot,
}: {
  role: "doctor" | "reception";
  snapshot: ClinicSnapshot;
}) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfDay(now);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = startOfDay(now);
  monthStart.setDate(1);

  const waiting = snapshot.visits.filter((visit) => visit.status === "Waiting").length;
  const consulting = snapshot.visits.filter(
    (visit) => visit.status === "In Consultation",
  ).length;
  const billing = snapshot.visits.filter(
    (visit) => visit.status === "Ready for Billing",
  ).length;
  const lowStock = snapshot.medicines
    .filter((medicine) => medicine.stock <= LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock - b.stock);
  const today = summarize(snapshot.visits, todayStart);
  const periods = [
    { label: "Daily", detail: "Today", data: today, color: "border-sky-200 bg-sky-50/70" },
    {
      label: "Weekly",
      detail: "Last 7 days",
      data: summarize(snapshot.visits, weekStart),
      color: "border-emerald-200 bg-emerald-50/70",
    },
    {
      label: "Monthly",
      detail: "Current month",
      data: summarize(snapshot.visits, monthStart),
      color: "border-amber-200 bg-amber-50/70",
    },
  ];
  const primaryCards =
    role === "doctor"
      ? [
          { label: "Waiting", value: waiting, detail: "Patients ready to see" },
          { label: "Consulting", value: consulting, detail: "Started consultations" },
          { label: "Today's patients", value: today.patients, detail: `${today.visits} visits today` },
          { label: "Medicines", value: snapshot.medicines.length, detail: `${lowStock.length} low-stock reminders` },
        ]
      : [
          { label: "Registered patients", value: snapshot.patients.length, detail: "Total patient records" },
          { label: "Waiting", value: waiting, detail: "In today's queue" },
          { label: "Ready to bill", value: billing, detail: "Doctor finished" },
          { label: "Stock reminders", value: lowStock.length, detail: `At or below ${LOW_STOCK_LIMIT} units` },
        ];

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60" key={card.label}>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
            <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-500">Clinic activity</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Daily, weekly, monthly
          </h3>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {periods.map(({ label, detail, data, color }) => (
            <article className={`rounded-[28px] border p-5 ${color}`} key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{label}</p>
                  <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                  {data.completed} completed
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Patients</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{data.patients}</p>
                  <p className="mt-1 text-xs text-slate-500">{data.visits} visits</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Medicine</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{data.medicineUnits}</p>
                  <p className="mt-1 text-xs text-slate-500">units issued</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Paid total</p>
                <p className="mt-2 text-xl font-semibold">{data.revenue.toLocaleString()} MMK</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">Current workflow</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Live patient status</h3>
          <div className="mt-5 grid gap-3">
            {[
              ["Waiting", waiting],
              ["With doctor", consulting],
              ["Ready for billing", billing],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4" key={label}>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            href={role === "doctor" ? "/doctor/queue" : "/reception/queue"}
          >
            Open patient queue
          </Link>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">Stock reminder</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Low medicines</h3>
          <div className="mt-5 grid gap-3">
            {lowStock.slice(0, 5).map((medicine) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4" key={medicine.id}>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{medicine.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Limit {LOW_STOCK_LIMIT}</p>
                </div>
                <span className="text-sm font-bold text-rose-700">{medicine.stock} {medicine.unit}</span>
              </div>
            ))}
            {!lowStock.length ? (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">All medicine stock is healthy.</p>
            ) : null}
          </div>
          <Link
            className="mt-4 inline-flex rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            href={`/${role}/stock`}
          >
            View medicine stock
          </Link>
        </article>
      </section>
    </>
  );
}
