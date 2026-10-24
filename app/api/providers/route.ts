import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const providers = await prisma.provider.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(providers);
}
