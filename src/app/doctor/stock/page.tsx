import { DashboardShell } from "@/components/dashboard-shell";
import { MedicineStockTable } from "@/components/medicine-stock-table";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Queue" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function DoctorStockPage() {
  const session = await requireSession(["doctor"]);
  const snapshot = await getClinicSnapshot();

  return (
    <DashboardShell
      activeHref="/doctor/stock"
      navItems={navItems}
      session={session}
      subtitle="Check medicine availability and pricing while preparing prescriptions."
      title="Doctor dashboard"
    >
      <MedicineStockTable
        description="Check availability, unit prices, and expiry dates while preparing prescriptions."
        medicines={snapshot.medicines}
        title="Medicine reference"
      />
    </DashboardShell>
  );
}
