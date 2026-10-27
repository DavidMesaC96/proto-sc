import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const NAMES_REQUESTER = [
  "María García", "Juan López", "Ana Martínez", "Carlos Rodríguez",
  "Sofía Pérez", "Diego Fernández", "Elena González", "Pablo Sánchez",
];

const NAMES_ANALYST = [
  "David Mesacortes", "Laura Moreno", "Felipe Gutiérrez", "Camila Torres",
];

const DEPARTMENTS = [
  "Recursos Humanos", "Tecnología", "Finanzas", "Operaciones",
  "Marketing", "Legal", "Logística", "Calidad",
];

const PROVIDERS = [
  { name: "Telco Solutions", type: "Telecomunicaciones", email: "support@telco.com", phone: "+57 1 2345678" },
  { name: "CloudTech Services", type: "Infraestructura", email: "support@cloudtech.com", phone: "+57 1 9876543" },
  { name: "SecureNet", type: "Seguridad", email: "support@securenet.com", phone: "+57 1 5555555" },
  { name: "DataFlow Corp", type: "Integración", email: "support@dataflow.com", phone: "+57 1 4444444" },
  { name: "Licencias SAS", type: "LICENSING", email: "soporte@licencias.com", phone: "6011234567" },
  { name: "TechService Mantenimiento", type: "MAINTENANCE", email: "soporte@techservice.com", phone: "6019876543" },
];

const CASE_TITLES = [
  "Error al acceder al sistema de nómina",
  "Solicitud de nuevo usuario en Active Directory",
  "Servidor de correo no responde",
  "Necesito acceso a base de datos de clientes",
  "Fallo en integración con SAP",
  "Problema con VPN corporativa",
  "Solicitud de aumento de cuota de almacenamiento",
  "Error en reportes de facturación",
  "Necesito cambiar contraseña de acceso",
  "Problema de conectividad en oficina central",
  "Solicitud de instalación de software",
  "Fallo en backup automático",
  "Error en sistema de inventario",
  "Necesito acceso a archivos compartidos",
  "Problema con impresora de red",
  "Caída de aplicación crítica",
  "Solicitud de configuración de email",
  "Error en proceso de compras",
  "Necesito acceso a portal de clientes",
  "Problema de sincronización de datos",
];

const DESCRIPTIONS = [
  "No puedo acceder a la aplicación. Recibo error 403 Forbidden. Necesito acceso urgente.",
  "Necesito crear un usuario nuevo para el personal recientemente contratado.",
  "El servicio está caído hace aproximadamente 2 horas.",
  "Requiero permisos de lectura/escritura en las tablas especificadas.",
  "La integración dejó de funcionar después de la actualización.",
  "No puedo conectarme a través de la VPN, aparece error de autenticación.",
  "Mi espacio en el servidor está al máximo, necesito espacio adicional.",
  "Los reportes no se generan correctamente desde ayer.",
  "Olvidé mi contraseña y necesito resetearla urgentemente.",
  "Algunos departamentos no pueden conectarse a internet.",
  "Necesito instalar una herramienta específica en mi máquina.",
  "El backup de anoche no se completó correctamente.",
  "El sistema muestra datos inconsistentes en el inventario.",
  "Perdí acceso a las carpetas compartidas después de la reorganización.",
  "La impresora no responde desde esta mañana.",
  "La aplicación se cerró sin previo aviso y afecta a 50+ usuarios.",
  "No me llegan los correos corporativos después de cambiar de máquina.",
  "El módulo de compras está lento y genera timeouts.",
  "El portal no me permite ingresar con mis credenciales.",
  "Los datos no se actualizan en tiempo real como debería.",
];

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_USER", "WAITING_PROVIDER", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = ["INCIDENT", "REQUEST", "CHANGE"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toEmail(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".");
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  console.log("🌱 Limpiando datos existentes...");
  await prisma.escalation.deleteMany({});
  await prisma.caseUpdate.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.user.deleteMany({});

  // Create requesters
  console.log("📝 Creando solicitantes...");
  const requesters = await Promise.all(
    NAMES_REQUESTER.map(async (name) => {
      const password = await hash("password123");
      return prisma.user.create({
        data: {
          name,
          email: `${toEmail(name)}@sistecredito.com`,
          password,
          role: "REQUESTER",
          department: getRandomElement(DEPARTMENTS),
        },
      });
    })
  );
  console.log(`✅ ${requesters.length} solicitantes creados\n`);

  // Create analysts
  console.log("👨‍💼 Creando analistas...");
  const analysts = await Promise.all(
    NAMES_ANALYST.map(async (name) => {
      const password = await hash("password123");
      return prisma.user.create({
        data: {
          name,
          email: `${toEmail(name)}@sistecredito.com`,
          password,
          role: "ANALYST",
          department: "Mesa de Servicios",
        },
      });
    })
  );
  console.log(`✅ ${analysts.length} analistas creados\n`);

  // Create manager
  console.log("👔 Creando responsable...");
  const manager = await prisma.user.create({
    data: {
      name: "Carlos Responsable",
      email: "carlos.responsable@sistecredito.com",
      password: await hash("password123"),
      role: "MANAGER",
      department: "Tecnología",
    },
  });
  console.log(`✅ Responsable creado: ${manager.name}\n`);

  // Create providers
  console.log("🏢 Creando proveedores...");
  const providers = await Promise.all(
    PROVIDERS.map((p) =>
      prisma.provider.create({
        data: p,
      })
    )
  );
  console.log(`✅ ${providers.length} proveedores creados\n`);

  // Create 100 cases
  console.log("🎫 Creando 100 casos...");
  let createdCount = 0;

  for (let i = 0; i < 100; i++) {
    const requester = getRandomElement(requesters);
    const analyst = getRandomElement(analysts);
    const status = getRandomElement(STATUSES);
    const priority = getRandomElement(PRIORITIES);
    const category = getRandomElement(CATEGORIES);
    const titleIdx = i % CASE_TITLES.length;
    const descIdx = i % DESCRIPTIONS.length;
    const daysAgo = getRandomInt(1, 60);

    const newCase = await prisma.case.create({
      data: {
        title: `${CASE_TITLES[titleIdx]} #${i + 1}`,
        description: DESCRIPTIONS[descIdx],
        category,
        priority,
        status,
        requesterId: requester.id,
        assignedToId: analyst.id,
        estimatedTime: priority === "CRITICAL" ? 2 : priority === "HIGH" ? 8 : 24,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });

    // Add 1-3 updates to some cases
    if (Math.random() > 0.5) {
      const updateCount = getRandomInt(1, 3);
      for (let j = 0; j < updateCount; j++) {
        const updateAuthor = Math.random() > 0.3 ? analyst : requester;

        await prisma.caseUpdate.create({
          data: {
            caseId: newCase.id,
            authorId: updateAuthor.id,
            message: `Actualización: ${j + 1}. Trabajando en la resolución.`,
            newStatus: status,
            createdAt: new Date(newCase.createdAt.getTime() + (j + 1) * 12 * 60 * 60 * 1000),
          },
        });
      }
    }

    // Add escalation to some cases
    if (Math.random() > 0.7 && (status === "WAITING_PROVIDER" || status === "IN_PROGRESS")) {
      await prisma.escalation.create({
        data: {
          caseId: newCase.id,
          providerId: getRandomElement(providers).id,
          status: status === "WAITING_PROVIDER" ? "PENDING" : "RESOLVED",
          notes: "Escalado al proveedor externo para resolución especializada.",
        },
      });
    }

    createdCount++;
    if (createdCount % 10 === 0) {
      console.log(`  → ${createdCount}/100 casos creados`);
    }
  }

  console.log(`✅ 100 casos creados\n`);

  console.log("═══════════════════════════════════════════════");
  console.log("✨ Seed completado exitosamente!");
  console.log("═══════════════════════════════════════════════\n");

  console.log("📊 Resumen:");
  console.log(`  • Solicitantes: ${requesters.length}`);
  console.log(`  • Analistas: ${analysts.length}`);
  console.log(`  • Responsable: 1`);
  console.log(`  • Proveedores: ${providers.length}`);
  console.log(`  • Casos: 100\n`);

  console.log("🔑 Credenciales de prueba:");
  console.log(`  Analista (recomendado):`);
  console.log(`    Email: david.mesacortes@sistecredito.com`);
  console.log(`    Password: password123\n`);
  console.log(`  Manager:`);
  console.log(`    Email: carlos.responsable@sistecredito.com`);
  console.log(`    Password: password123\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
