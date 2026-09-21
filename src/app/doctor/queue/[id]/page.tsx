import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { DoctorConsultation } from "@/components/doctor-actions";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Waiting" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function DoctorConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(["doctor"]);
  const snapshot = await getClinicSnapshot();
  const { id } = await params;
  const visit = snapshot.visits.find((entry) => entry.id === id);

  if (!visit || visit.status === "Completed") {
    notFound();
  }

  const history = snapshot.visits
    .filter((entry) => entry.patientId === visit.patientId && entry.id !== visit.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <DashboardShell
      activeHref="/doctor/queue"
      navItems={navItems}
      session={session}
      subtitle={`${visit.patientName} • ${visit.patientCode} • focused consultation`}
      title="Doctor dashboard"
    >
      <DoctorConsultation history={history} medicines={snapshot.medicines} visit={visit} />
    </DashboardShell>
  );
}
