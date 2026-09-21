import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Waiting" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function DoctorHistoryPage() {
  const session = await requireSession(["doctor"]);
  const snapshot = await getClinicSnapshot();
  const patientHistory = snapshot.patients
    .map((patient) => ({
      patient,
      visits: snapshot.visits
        .filter((visit) => visit.patientId === patient.id && visit.status !== "Waiting")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }))
    .filter((entry) => entry.visits.length > 0);

  return (
    <DashboardShell
      activeHref="/doctor/history"
      navItems={navItems}
      session={session}
      subtitle="Continue active consultations and review completed patient records."
      title="Doctor dashboard"
    >
      <section className="grid gap-4">
        {patientHistory.map(({ patient, visits }) => (
            <article key={patient.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{patient.name}</p>
                  <p className="text-sm text-slate-500">
                    {patient.patientCode} • {patient.phone}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {visits.length} visits
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {visits.map((visit) => (
                  <div key={visit.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {new Date(visit.createdAt).toLocaleString()}
                          </p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            visit.status === "Completed"
                              ? "bg-slate-200 text-slate-700"
                              : visit.status === "Ready for Billing"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {visit.status === "Completed"
                              ? "Completed"
                              : visit.status === "Ready for Billing"
                                ? "Waiting for reception"
                                : "Consulting"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {visit.diagnosis || visit.symptoms.join(", ") || "No notes yet"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Fee {visit.consultationFee.toLocaleString()} MMK • Medicine {visit.medicineCharge.toLocaleString()} MMK
                        </p>
                      </div>
                      {visit.status !== "Completed" ? (
                        <Link
                          className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-center text-sm font-semibold text-white"
                          href={`/doctor/queue/${visit.id}`}
                        >
                          Manage
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
        ))}
        {!patientHistory.length ? (
          <p className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm shadow-slate-200/60">
            No consultations have started yet. Choose the next patient from Waiting.
          </p>
        ) : null}
      </section>
    </DashboardShell>
  );
}
