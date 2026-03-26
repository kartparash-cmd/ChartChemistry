import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, sign, source } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Upsert — if they already subscribed, update sign/source
    await prisma.emailSubscriber.upsert({
      where: { email: normalizedEmail },
      update: { sign: sign || undefined, source: source || undefined },
      create: {
        email: normalizedEmail,
        sign: sign || null,
        source: source || "exit_popup",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
