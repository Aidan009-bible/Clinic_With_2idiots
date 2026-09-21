import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { createVisit } from "@/lib/clinic-server";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !["admin", "reception"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    patientId?: string;
    symptoms?: string;
  };

  try {
    const visit = await createVisit({
      patientId: String(body.patientId ?? ""),
      symptoms: String(body.symptoms ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    revalidatePath("/reception/visits");
    revalidatePath("/reception/queue");
    revalidatePath("/reception/billing");
    revalidatePath("/reception/stock");
    revalidatePath("/doctor/queue");
    revalidatePath("/doctor/history");
    revalidatePath("/admin/overview");
    return NextResponse.json({ visit });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create visit." },
      { status: 400 },
    );
  }
}
