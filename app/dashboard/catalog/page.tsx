import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { BookOpen, Zap, FileText, RefreshCw, HelpCircle, ChevronRight } from "lucide-react";

const SERVICES = [
  {
    category: "Soporte técnico",
    color: "var(--cyan)",
    bg: "var(--cyan-dim)",
    Icon: Zap,
    items: [
      { title: "Falla de sistema",       desc: "El sistema no responde o tiene errores",           sla: "4h",  priority: "HIGH"     },
      { title: "Acceso bloqueado",        desc: "No puedo ingresar a una aplicación o recurso",    sla: "8h",  priority: "MEDIUM"   },
      { title: "Error en transacción",   desc: "Falla en un proceso o transacción financiera",    sla: "2h",  priority: "CRITICAL" },
      { title: "Impresora / periférico", desc: "Dispositivo físico con falla o sin configurar",  sla: "24h", priority: "LOW"      },
    ],
  },
  {
    category: "Solicitudes",
    color: "#A78BFA",
    bg: "rgba(167,139,250,.12)",
    Icon: FileText,
    items: [
      { title: "Nuevo usuario",          desc: "Crear cuenta y permisos para colaborador",         sla: "24h", priority: "MEDIUM" },
      { title: "Instalación de software", desc: "Instalar o actualizar una aplicación",            sla: "24h", priority: "MEDIUM" },
      { title: "Acceso VPN",             desc: "Configurar acceso remoto seguro",                  sla: "8h",  priority: "MEDIUM" },
      { title: "Equipo de cómputo",      desc: "Solicitar reemplazo o nuevo equipo",               sla: "72h", priority: "LOW"    },
    ],
  },
  {
    category: "Cambios",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    Icon: RefreshCw,
    items: [
      { title: "Actualización de sistema", desc: "Solicitar parche o versión nueva",               sla: "48h", priority: "MEDIUM" },
      { title: "Cambio de configuración",  desc: "Modificar parámetros de un servicio",            sla: "24h", priority: "MEDIUM" },
      { title: "Migración de datos",       desc: "Mover información entre sistemas",               sla: "72h", priority: "HIGH"   },
    ],
  },
  {
    category: "Consultas",
    color: "var(--green)",
    bg: "var(--green-dim)",
    Icon: HelpCircle,
    items: [
      { title: "Capacitación",             desc: "Solicitar entrenamiento en una herramienta",     sla: "72h", priority: "LOW"    },
      { title: "Documentación",            desc: "Pedir guía o manual de un proceso",              sla: "48h", priority: "LOW"    },
      { title: "Consulta general",         desc: "Preguntas sobre procesos o sistemas",            sla: "24h", priority: "LOW"    },
    ],
  },
];

const PRIORITY_STYLE: Record<string, { color: string; label: string }> = {
  CRITICAL: { color: "var(--red)",    label: "Crítica" },
  HIGH:     { color: "var(--amber)",  label: "Alta"    },
  MEDIUM:   { color: "var(--sky)",    label: "Media"   },
  LOW:      { color: "var(--text-3)", label: "Baja"    },
};

export default async function CatalogPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 fade-up">
      <PageHeader
        title="Catálogo de servicios"
        subtitle="Selecciona un servicio para crear un ticket pre-configurado"
        userName={user.name}
        userRole={user.role}
      />

      {/* Grid */}
      <div className="space-y-5">
        {SERVICES.map((section, si) => (
          <div key={section.category} className={`fade-up d${si + 1}`}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{ width: 36, height: 36, borderRadius: 10, background: section.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <section.Icon size={18} style={{ color: section.color }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: "1rem", color: section.color }}>{section.category}</p>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span className="hint" style={{ fontSize: ".78rem" }}>{section.items.length} servicios</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {section.items.map(item => {
                const ps = PRIORITY_STYLE[item.priority];
                const params = new URLSearchParams({
                  title: item.title,
                  category: section.Icon === Zap ? "INCIDENT" : section.Icon === FileText ? "REQUEST" : "CHANGE",
                  priority: item.priority,
                }).toString();

                return (
                  <Link
                    key={item.title}
                    href={`/dashboard/cases/new?${params}`}
                    className="glass-card glass-card-hover"
                    style={{ textDecoration: "none", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: 700, fontSize: ".95rem", lineHeight: 1.35, color: "var(--text-1)" }}>
                        {item.title}
                      </p>
                      <ChevronRight size={16} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
                    </div>
                    <p className="hint" style={{ fontSize: ".82rem", lineHeight: 1.55, flex: 1 }}>
                      {item.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: ps.color, flexShrink: 0 }} />
                        <span style={{ fontSize: ".72rem", color: ps.color, fontWeight: 700 }}>{ps.label}</span>
                      </div>
                      <span className="hint" style={{ fontSize: ".72rem" }}>SLA · {item.sla}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
