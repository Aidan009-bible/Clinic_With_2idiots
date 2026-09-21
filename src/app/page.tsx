import { redirect } from "next/navigation";

import { getRoleHome, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getRoleHome(session.role));
}
