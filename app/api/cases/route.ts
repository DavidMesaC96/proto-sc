import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const where = user.role === "REQUESTER" ? { requesterId: user.id } : {};

  const cases = await prisma.case.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true, email: true, department: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      escalation: { include: { provider: true } },
      _count: { select: { updates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { title, description, category, priority } = body;

  if (!title || !description || !category || !priority) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios: título, descripción, categoría y prioridad" },
      { status: 400 }
    );
  }

  const estimatedHours: Record<string, number> = {
    LOW: 72,
    MEDIUM: 24,
    HIGH: 8,
    CRITICAL: 2,
  };

  const newCase = await prisma.case.create({
    data: {
      title,
      description,
      category,
      priority,
      requesterId: user.id,
      estimatedTime: estimatedHours[priority] ?? 24,
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.caseUpdate.create({
    data: {
      caseId: newCase.id,
      authorId: user.id,
      message: "Caso registrado en el sistema.",
      newStatus: "OPEN",
    },
  });

  return NextResponse.json(newCase, { status: 201 });
}
