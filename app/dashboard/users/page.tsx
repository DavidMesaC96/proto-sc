import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma }     from "@/lib/prisma";
import PageHeader     from "@/components/PageHeader";
import { Users, Shield, UserCheck, User } from "lucide-react";

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  MANAGER:   { label: "Responsable", color: "#002B7A", bg: "rgba(0,43,122,.08)",   Icon: Shield    },
  ANALYST:   { label: "Analista",    color: "#007A3D", bg: "rgba(0,200,83,.10)",   Icon: UserCheck },
  REQUESTER: { label: "Usuario",     color: "#6B7280", bg: "rgba(107,114,128,.08)", Icon: User      },
};

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "REQUESTER") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, email: true,
      role: true, department: true, createdAt: true,
      _count: { select: { cases: true, assignedCases: true } },
    },
  });

  const managers  = users.filter(u => u.role === "MANAGER");
  const analysts  = users.filter(u => u.role === "ANALYST");
  const requesters = users.filter(u => u.role === "REQUESTER");

  return (
    <div className="flex flex-col gap-5 fade-up">
      <PageHeader
        title="Usuarios"
        subtitle={`${users.length} usuarios registrados · ${analysts.length} analistas · ${requesters.length} solicitantes`}
        userName={session.name}
        userRole={session.role}
      />

      {/* ── KPI strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Responsables", count: managers.length,   color: "#002B7A", bg: "rgba(0,43,122,.07)",   Icon: Shield    },
          { label: "Analistas",    count: analysts.length,   color: "#007A3D", bg: "rgba(0,200,83,.08)",   Icon: UserCheck },
          { label: "Solicitantes", count: requesters.length, color: "#6B7280", bg: "rgba(107,114,128,.07)", Icon: User      },
        ].map(k => (
          <div key={k.label} style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,43,122,.08)",
            borderRadius: 16,
            padding: "22px 24px",
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 2px 8px rgba(0,43,122,.06)",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: k.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <k.Icon size={22} style={{ color: k.color }} />
            </div>
            <div>
              <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#002B7A", lineHeight: 1 }}>{k.count}</p>
              <p style={{ fontSize: ".78rem", color: "#6B7280", marginTop: 3 }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── User table ── */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,43,122,.08)",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,43,122,.06)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid rgba(0,43,122,.08)",
          background: "#F4F6F8",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={17} style={{ color: "#002B7A" }} />
            <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#002B7A" }}>
              Todos los usuarios
            </span>
            <span style={{
              padding: "2px 10px", borderRadius: 999,
              background: "rgba(0,43,122,.08)", color: "#002B7A",
              fontSize: ".7rem", fontWeight: 800,
            }}>{users.length}</span>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 2.5fr 1fr 1.2fr 0.8fr",
          padding: "10px 24px",
          borderBottom: "1px solid rgba(0,43,122,.06)",
          background: "#FAFBFC",
        }}>
          {["Usuario", "Correo", "Rol", "Departamento", "Casos"].map(h => (
            <span key={h} style={{
              fontSize: ".68rem", fontWeight: 700,
              color: "#9CA3AF", letterSpacing: ".06em", textTransform: "uppercase",
            }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {users.map((u, i) => {
          const cfg      = ROLE_CFG[u.role];
          const initials = u.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
          const isLast   = i === users.length - 1;
          const casos    = u.role === "REQUESTER" ? u._count.cases : u._count.assignedCases;

          return (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.5fr 1fr 1.2fr 0.8fr",
                padding: "14px 24px",
                alignItems: "center",
                borderBottom: isLast ? "none" : "1px solid rgba(0,43,122,.05)",
              }}
            >
              {/* Nombre */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                  background: cfg.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: ".68rem", color: cfg.color,
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".88rem", color: "#0D1B3E" }}>{u.name}</p>
                  <p style={{ fontSize: ".68rem", color: "#9CA3AF" }}>
                    Desde {new Date(u.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Correo */}
              <p style={{ fontSize: ".82rem", color: "#374151" }}>{u.email}</p>

              {/* Rol */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: cfg.bg, color: cfg.color,
                  fontSize: ".68rem", fontWeight: 700,
                  width: "fit-content",
                }}>
                  <cfg.Icon size={11} />
                  {cfg.label}
                </span>
                <span style={{
                  fontSize: ".62rem", color: "#9CA3AF",
                  fontFamily: "monospace", letterSpacing: ".03em",
                }}>
                  {u.role}
                </span>
              </div>

              {/* Departamento */}
              <p style={{ fontSize: ".82rem", color: "#6B7280" }}>{u.department ?? "—"}</p>

              {/* Casos */}
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 10,
                background: casos > 0 ? "rgba(0,43,122,.07)" : "transparent",
                fontWeight: 700, fontSize: ".82rem", color: casos > 0 ? "#002B7A" : "#9CA3AF",
              }}>
                {casos}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
