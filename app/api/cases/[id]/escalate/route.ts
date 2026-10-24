import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role === "REQUESTER") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await params;
  const { providerId, notes } = await req.json();

  if (!providerId) {
    return NextResponse.json({ error: "Proveedor requerido" }, { status: 400 });
  }

  const existing = await prisma.escalation.findUnique({ where: { caseId: id } });
  if (existing) {
    return NextResponse.json({ error: "El caso ya fue escalado" }, { status: 409 });
  }

  const escalation = await prisma.escalation.create({
    data: { caseId: id, providerId, notes },
    include: { provider: true },
  });

  await prisma.case.update({ where: { id }, data: { status: "WAITING_PROVIDER" } });

  await prisma.caseUpdate.create({
    data: {
      caseId: id,
      authorId: user.id,
      message: `Caso escalado al proveedor ${escalation.provider.name}. ${notes || ""}`.trim(),
      oldStatus: "IN_PROGRESS",
      newStatus: "WAITING_PROVIDER",
    },
  });

  return NextResponse.json(escalation, { status: 201 });
}
