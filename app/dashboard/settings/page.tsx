import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { User, Bell, Shield } from "lucide-react";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const ROLE_LABEL: Record<string, string> = {
    REQUESTER: "Usuario final",
    ANALYST: "Analista de soporte",
    MANAGER: "Responsable / Gestor",
  };

  const SECTIONS = [
    {
      icon: User,
      title: "Perfil",
      color: "var(--cyan)",
      bg: "var(--cyan-dim)",
      fields: [
        { label: "Nombre completo", value: user.name },
        { label: "Correo electrónico", value: user.email },
        { label: "Rol", value: ROLE_LABEL[user.role] ?? user.role },
        { label: "Departamento", value: (user as { department?: string }).department ?? "—" },
      ],
    },
    {
      icon: Bell,
      title: "Notificaciones",
      color: "#A78BFA",
      bg: "rgba(167,139,250,.12)",
      fields: [
        { label: "Alertas de ticket asignado", value: "Activo" },
        { label: "Cambios de estado", value: "Activo" },
        { label: "Escalamientos", value: "Activo" },
        { label: "Resumen semanal", value: "Inactivo" },
      ],
    },
    {
      icon: Shield,
      title: "Seguridad",
      color: "var(--amber)",
      bg: "var(--amber-dim)",
      fields: [
        { label: "Último acceso", value: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) },
        { label: "Sesiones activas", value: "1" },
        { label: "Autenticación de dos factores", value: "No configurado" },
      ],
    },
  ];

  return (
    <div className="space-y-6 fade-up">
      <PageHeader
        title="Ajustes"
        subtitle="Configuración de cuenta y preferencias"
        userName={user.name}
        userRole={user.role}
        showNewTicket={false}
      />

      {/* Profile card */}
      <div
        className="glass-card"
        style={{ padding: 28, display: "flex", alignItems: "center", gap: 24, borderLeft: `3px solid var(--cyan)` }}
      >
        <div
          style={{ width: 72, height: 72, borderRadius: 999, flexShrink: 0, background: "var(--cyan-dim)", color: "var(--cyan)", fontSize: "1.5rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-1)", lineHeight: 1.2 }}>{user.name}</p>
          <p className="hint" style={{ marginTop: 5, fontSize: ".85rem" }}>{user.email}</p>
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "5px 14px", borderRadius: 999, background: "var(--cyan-dim)", fontSize: ".78rem", color: "var(--cyan)", fontWeight: 700 }}
          >
            {ROLE_LABEL[user.role] ?? user.role}
          </div>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => (
        <div key={section.title} className="glass-card overflow-hidden">
          <div
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
          >
            <div
              style={{ width: 36, height: 36, borderRadius: 10, background: section.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <section.icon size={18} style={{ color: section.color }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text-1)" }}>{section.title}</p>
          </div>
          <div>
            {section.fields.map((field, fi) => (
              <div key={field.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: fi < section.fields.length - 1 ? "1px solid var(--border)" : "none" }}>
                <p style={{ fontSize: ".88rem", color: "var(--text-3)" }}>{field.label}</p>
                <p style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--text-1)" }}>{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="hint text-center" style={{ fontSize: ".7rem", paddingBottom: 8 }}>
        Para cambiar tu contraseña o rol, contacta al administrador del sistema.
      </p>
    </div>
  );
}
