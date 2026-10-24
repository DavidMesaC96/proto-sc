import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import bcrypt from "bcryptjs";


const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  const manager = await prisma.user.upsert({
    where: { email: "jefe@sistecredito.com" },
    update: {},
    create: {
      name: "Carlos Responsable",
      email: "jefe@sistecredito.com",
      password: await hash("Admin123!"),
      role: "MANAGER",
      department: "TI",
      phone: "3001234567",
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analista@sistecredito.com" },
    update: {},
    create: {
      name: "Ana Analista",
      email: "analista@sistecredito.com",
      password: await hash("Analista123!"),
      role: "ANALYST",
      department: "Mesa de Ayuda",
      phone: "3009876543",
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: "usuario@sistecredito.com" },
    update: {},
    create: {
      name: "David Usuario",
      email: "usuario@sistecredito.com",
      password: await hash("Usuario123!"),
      role: "REQUESTER",
      department: "Contabilidad",
      phone: "3005551234",
    },
  });

  const p1 = await prisma.provider.upsert({
    where: { id: "provider-1" },
    update: {},
    create: {
      id: "provider-1",
      name: "Licencias SAS",
      type: "LICENSING",
      email: "soporte@licencias.com",
      phone: "6011234567",
    },
  });

  await prisma.provider.upsert({
    where: { id: "provider-2" },
    update: {},
    create: {
      id: "provider-2",
      name: "TechService Mantenimiento",
      type: "MAINTENANCE",
      email: "soporte@techservice.com",
      phone: "6019876543",
    },
  });

  await prisma.provider.upsert({
    where: { id: "provider-3" },
    update: {},
    create: {
      id: "provider-3",
      name: "ITSM Platform Co.",
      type: "ITSM",
      email: "admin@itsmplatform.com",
    },
  });

  const demoCase = await prisma.case.create({
    data: {
      title: "Microsoft Office no abre en equipo contabilidad",
      description:
        "Al hacer doble clic en Excel aparece error de licencia y el programa no inicia. Equipo: PC-CONT-04",
      category: "INCIDENT",
      priority: "HIGH",
      status: "WAITING_PROVIDER",
      estimatedTime: 8,
      requesterId: requester.id,
      assignedToId: analyst.id,
    },
  });

  await prisma.caseUpdate.createMany({
    data: [
      {
        caseId: demoCase.id,
        authorId: requester.id,
        message: "Caso registrado en el sistema.",
        newStatus: "OPEN",
      },
      {
        caseId: demoCase.id,
        authorId: analyst.id,
        message: "Revisado. Problema de licencia confirmado. Escalaré al proveedor.",
        oldStatus: "OPEN",
        newStatus: "IN_PROGRESS",
      },
      {
        caseId: demoCase.id,
        authorId: analyst.id,
        message: "Caso escalado al proveedor Licencias SAS. Esperando respuesta.",
        oldStatus: "IN_PROGRESS",
        newStatus: "WAITING_PROVIDER",
      },
    ],
  });

  await prisma.escalation.create({
    data: {
      caseId: demoCase.id,
      providerId: p1.id,
      notes: "Renovación de licencia Office 365 para equipo PC-CONT-04",
      status: "PENDING",
    },
  });

  console.log("✅ Seed completado");
  console.log("👤 Usuarios de prueba:");
  console.log("   Jefe:     jefe@sistecredito.com     / Admin123!");
  console.log("   Analista: analista@sistecredito.com / Analista123!");
  console.log("   Usuario:  usuario@sistecredito.com  / Usuario123!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
