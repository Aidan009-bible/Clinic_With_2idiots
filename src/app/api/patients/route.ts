import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { createPatient } from "@/lib/clinic-server";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !["admin", "reception"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    age?: number;
    phone?: string;
    tags?: string;
  };

  try {
    const patient = await createPatient({
      name: String(body.name ?? ""),
      age: Number(body.age ?? 0),
      phone: String(body.phone ?? ""),
      tags: String(body.tags ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    revalidatePath("/reception/patients");
    revalidatePath("/reception/visits");
    revalidatePath("/admin/overview");
    return NextResponse.json({ patient });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create patient." },
      { status: 400 },
    );
  }
}
