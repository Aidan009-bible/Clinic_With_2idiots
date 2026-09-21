import { DashboardShell } from "@/components/dashboard-shell";
import { PortalOverview } from "@/components/portal-overview";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Waiting" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function DoctorOverviewPage() {
  const session = await requireSession(["doctor"]);
  const snapshot = await getClinicSnapshot();

  return (
    <DashboardShell
      activeHref="/doctor/overview"
      navItems={navItems}
      session={session}
      subtitle="See patient activity, current workflow, completed billing, and medicine reminders."
      title="Doctor dashboard"
    >
      <PortalOverview role="doctor" snapshot={snapshot} />
    </DashboardShell>
  );
}
