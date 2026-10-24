import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, email: true, department: true, phone: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      updates: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      escalation: { include: { provider: true } },
    },
  });

  if (!c) return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });

  if (user.role === "REQUESTER" && c.requesterId !== user.id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || user.role === "REQUESTER") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, assignedToId, message } = body;

  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });

  const updated = await prisma.case.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(assignedToId !== undefined && { assignedToId }),
      ...(status === "CLOSED" && { closedAt: new Date() }),
    },
  });

  if (message || status) {
    await prisma.caseUpdate.create({
      data: {
        caseId: id,
        authorId: user.id,
        message: message || `Estado actualizado a ${status}`,
        oldStatus: existing.status,
        newStatus: status || existing.status,
      },
    });
  }

  return NextResponse.json(updated);
}
