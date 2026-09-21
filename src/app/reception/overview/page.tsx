import { DashboardShell } from "@/components/dashboard-shell";
import { PortalOverview } from "@/components/portal-overview";
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

export default async function ReceptionOverviewPage() {
  const session = await requireSession(["reception"]);
  const snapshot = await getClinicSnapshot();

  return (
    <DashboardShell
      activeHref="/reception/overview"
      navItems={navItems}
      session={session}
      subtitle="See patient traffic, billing progress, completed totals, and stock reminders."
      title="Reception dashboard"
    >
      <PortalOverview role="reception" snapshot={snapshot} />
    </DashboardShell>
  );
}
