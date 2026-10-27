import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import PageHeader from "@/components/PageHeader";
import { Zap, ExternalLink, AlertTriangle } from "lucide-react";

export default async function IncidentsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "REQUESTER") redirect("/dashboard");

  const where: Record<string, unknown> = { category: "INCIDENT" };

  const incidents = await prisma.case.findMany({
    where,
    include: {
      requester:  { select: { name: true, department: true } },
      assignedTo: { select: { name: true } },
      escalation: { include: { provider: true } },
      _count:     { select: { updates: true } },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  const critical = incidents.filter(i => i.priority === "CRITICAL" && !["RESOLVED","CLOSED"].includes(i.status));
  const active   = incidents.filter(i => !["RESOLVED","CLOSED"].includes(i.status) && i.priority !== "CRITICAL");
  const resolved = incidents.filter(i => ["RESOLVED","CLOSED"].includes(i.status));

  return (
    <div className="space-y-5 fade-up">
      <PageHeader
        title="Incidentes"
        subtitle={`${incidents.length} total · ${critical.length} críticos activos`}
        userName={user.name}
        userRole={user.role}
      />

      {/* Critical alert */}
      {critical.length > 0 && (
        <div
          className="glass-card fade-in"
          style={{ padding: 22, border: "1px solid rgba(239,68,68,.4)", background: "rgba(239,68,68,.07)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <AlertTriangle size={18} style={{ color: "var(--red)" }} />
            <span style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--red)" }}>
              {critical.length} incidente{critical.length > 1 ? "s" : ""} crítico{critical.length > 1 ? "s" : ""} activo{critical.length > 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {critical.map(c => (
              <Link
                key={c.id} href={`/dashboard/cases/${c.id}`}
                className="trow"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)", textDecoration: "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="pulse" style={{ width: 10, height: 10, borderRadius: 999, background: "var(--red)", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: ".92rem", fontWeight: 600, color: "var(--text-1)" }}>{c.title}</span>
                </div>
                <ExternalLink size={14} style={{ color: "var(--text-3)" }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active incidents */}
      {active.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <p style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)" }}>En curso · {active.length}</p>
          </div>
          {active.map((c, i) => (
            <Link
              key={c.id} href={`/dashboard/cases/${c.id}`}
              className="trow"
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: i < active.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: ".92rem", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                <p className="hint" style={{ fontSize: ".76rem", marginTop: 3 }}>
                  {c.requester.name}{c.requester.department ? ` · ${c.requester.department}` : ""}
                </p>
              </div>
              <StatusBadge   status={c.status}   />
              <PriorityBadge priority={c.priority} />
              <ExternalLink size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <p style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-3)" }}>Resueltos · {resolved.length}</p>
          </div>
          {resolved.map((c, i) => (
            <Link
              key={c.id} href={`/dashboard/cases/${c.id}`}
              className="trow"
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 24px",
                borderBottom: i < resolved.length - 1 ? "1px solid var(--border)" : "none",
                textDecoration: "none", opacity: 0.6,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: ".88rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
              </div>
              <StatusBadge status={c.status} />
              <ExternalLink size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {incidents.length === 0 && (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", textAlign: "center" }}>
          <div className="text-5xl mb-4">✅</div>
          <p className="font-semibold text-base mb-1" style={{ color: "var(--text-2)" }}>Sin incidentes activos</p>
          <p className="hint">El sistema opera con normalidad.</p>
        </div>
      )}
    </div>
  );
}
