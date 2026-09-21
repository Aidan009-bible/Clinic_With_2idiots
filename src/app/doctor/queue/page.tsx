import { DashboardShell } from "@/components/dashboard-shell";
import { DoctorWaitingQueue } from "@/components/doctor-actions";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Waiting" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function DoctorQueuePage() {
  const session = await requireSession(["doctor"]);
  const snapshot = await getClinicSnapshot();
  const visits = snapshot.visits
    .filter((visit) => visit.status === "Waiting")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <DashboardShell
      activeHref="/doctor/queue"
      navItems={navItems}
      session={session}
      subtitle="Patients appear in reception check-in order. Press Next to open one focused consultation."
      title="Doctor dashboard"
    >
      <DoctorWaitingQueue visits={visits} />
    </DashboardShell>
  );
}
