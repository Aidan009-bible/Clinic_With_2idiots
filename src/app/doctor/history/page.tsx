import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Queue" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

function getVisitStatusStyle(status: string) {
  if (status === "Completed") {
    return "border-[#d8e4ec] bg-[#f7fafc] text-[#61758a]";
  }

  if (status === "Ready for Billing") {
    return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }

  return "border-[#cfe0ff] bg-[#e7f0ff] text-[#0b2a5b]";
}

function getVisitStatusLabel(status: string) {
  if (status === "Completed") {
    return "Completed";
  }

  if (status === "Ready for Billing") {
    return "Ready for billing";
  }

  return "In consultation";
}

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
  const totalVisits = patientHistory.reduce((sum, entry) => sum + entry.visits.length, 0);
  const completedVisits = patientHistory.reduce(
    (sum, entry) => sum + entry.visits.filter((visit) => visit.status === "Completed").length,
    0,
  );
  const openVisits = totalVisits - completedVisits;

  return (
    <DashboardShell
      activeHref="/doctor/history"
      navItems={navItems}
      session={session}
      subtitle="Continue active consultations and review completed patient records."
      title="Doctor dashboard"
    >
      <section className="grid gap-5">
        <div className="rounded-[20px] border border-[#d8e4ec] bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2f80ed]">Clinical records</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#071b33]">Patient visit history</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#61758a]">
                Review completed visits and continue any records still moving through consultation or billing.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 xl:min-w-[360px]">
              {[
                ["Patients", patientHistory.length, "with visit records"],
                ["Visits", totalVisits, "consultation entries"],
                ["Open", openVisits, "needs follow-up"],
              ].map(([label, value, detail]) => (
                <div className="rounded-2xl border border-[#d8e4ec] bg-[#f7fafc] px-4 py-3" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61758a]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#071b33]">{value}</p>
                  <p className="mt-1 text-xs text-[#8ca0b4]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {patientHistory.map(({ patient, visits }) => (
          <article
            className="overflow-hidden rounded-[20px] border border-[#d8e4ec] bg-white shadow-sm"
            key={patient.id}
          >
            <div className="flex flex-col justify-between gap-4 border-b border-[#d8e4ec] bg-[#f7fafc] p-5 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0b2a5b] text-lg font-semibold text-white">
                  {patient.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-semibold text-[#071b33]">{patient.name}</p>
                    <span className="rounded-full border border-[#cfe0ff] bg-[#e7f0ff] px-3 py-1 text-xs font-semibold text-[#0b2a5b]">
                      {patient.patientCode}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#61758a]">{patient.phone}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#d8e4ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#61758a]">
                  {visits.length} visit{visits.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full border border-[#d8e4ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#61758a]">
                  {visits.filter((visit) => visit.status === "Completed").length} completed
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#e7eef3]">
              {visits.map((visit) => (
                <div className="bg-white p-5 transition-colors hover:bg-[#fbfdff]" key={visit.id}>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_112px] lg:items-center">
                    <div className="min-w-0 break-words">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#071b33]">
                          {new Date(visit.createdAt).toLocaleString()}
                        </p>
                        {visit.status !== "Completed" ? <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getVisitStatusStyle(visit.status)}`}>
                          {getVisitStatusLabel(visit.status)}
                        </span> : null}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#071b33]">
                        {visit.diagnosis || "Diagnosis not recorded"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#61758a]">
                        <span className="text-xs font-medium">Symptoms · </span>
                        {visit.symptoms.join(", ") || "Not recorded"}
                      </p>
                    </div>

                    <div className="grid gap-2 rounded-xl bg-[#f7fafc] p-3 text-xs tabular-nums">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[#61758a]">Consultation</p>
                        <p className="whitespace-nowrap text-[#071b33]">{visit.consultationFee.toLocaleString()} MMK</p>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[#61758a]">Medicine</p>
                        <p className="whitespace-nowrap text-[#071b33]">{visit.medicineCharge.toLocaleString()} MMK</p>
                      </div>
                      <div className="flex items-baseline justify-between gap-3 border-t border-[#d8e4ec] pt-2 font-semibold text-[#071b33]">
                        <p>Total</p>
                        <p className="whitespace-nowrap text-sm">{visit.totalCharge.toLocaleString()} MMK</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-start lg:justify-center">
                      {visit.status !== "Completed" ? (
                        <Link
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0b2a5b] px-5 text-sm font-semibold text-white transition hover:bg-[#071b33]"
                          href={`/doctor/queue/${visit.id}`}
                        >
                          Manage
                        </Link>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full border border-[#d8e4ec] bg-[#f7fafc] px-3 py-1.5 text-xs font-medium text-[#61758a]">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
        {!patientHistory.length ? (
          <div className="rounded-[20px] border border-[#d8e4ec] bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f0ff] text-[#0b2a5b]">
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
                <path strokeLinecap="round" d="M10 9h4M10 13h4" />
              </svg>
            </div>
            <p className="mt-4 font-semibold text-[#071b33]">No consultation records yet</p>
            <p className="mt-1 text-sm text-[#61758a]">Choose the next patient from Queue to start building history.</p>
          </div>
        ) : null}
      </section>
    </DashboardShell>
  );
}
