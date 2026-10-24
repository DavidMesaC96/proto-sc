import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MetricWidget from "@/components/ui/MetricWidget";
import PageHeader from "@/components/PageHeader";
import { BarChart2, TrendingUp, CheckCircle2, Building2 } from "lucide-react";

export default async function ReportsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "REQUESTER") redirect("/dashboard");

  const cases = await prisma.case.findMany({
    include: { escalation: { include: { provider: true } } },
  });

  const total    = cases.length;
  const open     = cases.filter(c => c.status === "OPEN").length;
  const inProg   = cases.filter(c => c.status === "IN_PROGRESS").length;
  const withProv = cases.filter(c => c.status === "WAITING_PROVIDER").length;
  const resolved = cases.filter(c => c.status === "RESOLVED").length;
  const closed   = cases.filter(c => c.status === "CLOSED").length;
  const sla      = total ? Math.round(((resolved + closed) / total) * 100) : 0;

  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const c of cases) {
    byPriority[c.priority] = (byPriority[c.priority] ?? 0) + 1;
    byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
  }

  const providerCounts: Record<string, number> = {};
  for (const c of cases) {
    if (c.escalation?.provider?.name) {
      const n = c.escalation.provider.name;
      providerCounts[n] = (providerCounts[n] ?? 0) + 1;
    }
  }

  const PRIORITY_BARS = [
    { key: "CRITICAL", label: "Crítica",  color: "var(--red)"   },
    { key: "HIGH",     label: "Alta",     color: "var(--amber)" },
    { key: "MEDIUM",   label: "Media",    color: "var(--sky)"   },
    { key: "LOW",      label: "Baja",     color: "var(--text-3)" },
  ];

  const STATUS_BARS = [
    { key: "OPEN",             label: "Abierto",    color: "var(--sky)",   count: open     },
    { key: "IN_PROGRESS",      label: "En gestión", color: "var(--amber)", count: inProg   },
    { key: "WAITING_PROVIDER", label: "Proveedor",  color: "#A78BFA",      count: withProv },
    { key: "RESOLVED",         label: "Resuelto",   color: "var(--green)", count: resolved },
    { key: "CLOSED",           label: "Cerrado",    color: "var(--text-3)", count: closed  },
  ];

  const CAT_LABELS: Record<string, string> = {
    INCIDENT: "Incidentes", REQUEST: "Solicitudes", CHANGE: "Cambios",
  };

  return (
    <div className="space-y-6 fade-up">
      <PageHeader
        title="Reportes"
        subtitle={`${total} casos en total · vista general`}
        userName={user.name}
        userRole={user.role}
        showNewTicket={false}
      />

      {/* KPI row */}
      <div
        className="fade-up d1"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
      >
        <MetricWidget
          label="Total casos"
          value={total}
          sub="en el sistema"
          Icon={BarChart2}
          color="cyan"
          href="/dashboard/cases"
          raw={1}
        />
        <MetricWidget
          label="SLA compliance"
          value={`${sla}%`}
          sub={`${resolved + closed} resueltos`}
          Icon={TrendingUp}
          color="green"
          href="/dashboard/reports"
          raw={sla / 100}
        />
        <MetricWidget
          label="Resueltos"
          value={resolved + closed}
          sub={`de ${total} casos`}
          Icon={CheckCircle2}
          color="green"
          href="/dashboard/cases?status=RESOLVED"
          raw={total > 0 ? (resolved + closed) / total : 0}
        />
        <MetricWidget
          label="En proveedor"
          value={withProv}
          sub="esperando respuesta"
          Icon={Building2}
          color="purple"
          href="/dashboard/cases?status=WAITING_PROVIDER"
          raw={total > 0 ? withProv / total : 0}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {/* Por estado */}
        <div className="glass-card fade-up d2" style={{ padding: 28 }}>
          <p className="hint uppercase tracking-widest" style={{ fontSize: ".7rem", marginBottom: 22 }}>Por estado</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STATUS_BARS.map(s => (
              <div key={s.key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: ".88rem", fontWeight: 500, color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ fontWeight: 800, fontSize: ".92rem", color: s.color }}>{s.count}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "var(--surface-3)" }}>
                  <div
                    style={{ height: "100%", borderRadius: 999, width: total ? `${(s.count / total) * 100}%` : "0%", background: s.color, transition: "width .4s" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por prioridad */}
        <div className="glass-card fade-up d3" style={{ padding: 28 }}>
          <p className="hint uppercase tracking-widest" style={{ fontSize: ".7rem", marginBottom: 22 }}>Por prioridad</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PRIORITY_BARS.map(p => {
              const count = byPriority[p.key] ?? 0;
              return (
                <div key={p.key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: ".88rem", fontWeight: 500, color: "var(--text-2)" }}>{p.label}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: ".92rem", color: p.color }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "var(--surface-3)" }}>
                    <div
                      style={{ height: "100%", borderRadius: 999, width: total ? `${(count / total) * 100}%` : "0%", background: p.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por categoría */}
        <div className="glass-card fade-up d4" style={{ padding: 28 }}>
          <p className="hint uppercase tracking-widest" style={{ fontSize: ".7rem", marginBottom: 22 }}>Por categoría</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {Object.entries(byCategory).map(([cat, count]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".88rem", fontWeight: 500, color: "var(--text-2)" }}>{CAT_LABELS[cat] ?? cat}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 96, height: 8, borderRadius: 999, background: "var(--surface-3)" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${(count / total) * 100}%`, background: "var(--cyan)" }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: ".92rem", color: "var(--cyan)", width: 22, textAlign: "right" }}>{count}</span>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(providerCounts).length > 0 && (
            <>
              <div style={{ borderTop: "1px solid var(--border)", margin: "24px 0 20px" }} />
              <p className="hint uppercase tracking-widest" style={{ fontSize: ".7rem", marginBottom: 18 }}>Escalados a proveedor</p>
              {Object.entries(providerCounts).map(([name, count]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={14} style={{ color: "var(--text-3)" }} />
                    <span style={{ fontSize: ".88rem", color: "var(--text-2)" }}>{name}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: ".92rem", color: "#A78BFA" }}>{count}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
