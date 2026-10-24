import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const { message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
  }

  const c = await prisma.case.findUnique({ where: { id } });
  if (!c) return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });

  const update = await prisma.caseUpdate.create({
    data: { caseId: id, authorId: user.id, message },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json(update, { status: 201 });
}
