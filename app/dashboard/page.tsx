import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession }   from "@/lib/auth";
import { prisma }       from "@/lib/prisma";
import StatusBadge      from "@/components/StatusBadge";
import MetricWidget     from "@/components/ui/MetricWidget";
import Card             from "@/components/ui/Card";
import PageHeader       from "@/components/PageHeader";
import {
  CheckCircle2, AlertTriangle, Building2,
  ExternalLink, AlertCircle,
} from "lucide-react";

/* ── custom SVG ticket icon (no Lucide equivalent) ── */
function TicketIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size ?? 20} height={size ?? 20}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const where = user.role === "REQUESTER" ? { requesterId: user.id } : {};

  const cases = await prisma.case.findMany({
    where,
    include: {
      requester:  { select: { name: true, department: true } },
      assignedTo: { select: { name: true } },
      escalation: { include: { provider: true } },
      _count:     { select: { updates: true } },
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    take: 50,
  });

  const total    = cases.length;
  const open     = cases.filter(c => c.status === "OPEN").length;
  const inProg   = cases.filter(c => c.status === "IN_PROGRESS").length;
  const withProv = cases.filter(c => c.status === "WAITING_PROVIDER").length;
  const resolved = cases.filter(c => ["RESOLVED", "CLOSED"].includes(c.status)).length;
  const sla      = total ? Math.round((resolved / total) * 100) : 0;
  const critical = cases.filter(c => c.priority === "CRITICAL" && !["RESOLVED","CLOSED"].includes(c.status));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex flex-col gap-5 fade-up">

      <PageHeader
        title={user.role === "REQUESTER" ? "Mis solicitudes" : "Casos en gestión"}
        subtitle={`${greeting}, ${user.name.split(" ")[0]} · ${total} caso${total !== 1 ? "s" : ""} · ${open + inProg} activo${open + inProg !== 1 ? "s" : ""}`}
        userName={user.name}
        userRole={user.role}
      />

      {/* ── KPI Grid ── */}
      <div
        className="fade-up d1"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
      >
        <MetricWidget
          label="Tickets activos"
          value={open + inProg}
          sub={`${inProg} en gestión`}
          Icon={TicketIcon}
          color="cyan"
          href="/dashboard/cases?status=IN_PROGRESS"
          raw={total > 0 ? (open + inProg) / total : 0}
        />
        <MetricWidget
          label="SLA compliance"
          value={`${sla}%`}
          sub={`${resolved} resueltos`}
          Icon={CheckCircle2}
          color="green"
          href="/dashboard/reports"
          raw={sla / 100}
        />
        <MetricWidget
          label="Con proveedor"
          value={withProv}
          sub="esperando respuesta"
          Icon={Building2}
          color="purple"
          href="/dashboard/cases?status=WAITING_PROVIDER"
          raw={total > 0 ? withProv / total : 0}
        />
        <MetricWidget
          label="Críticos abiertos"
          value={critical.length}
          sub="atención inmediata"
          Icon={AlertTriangle}
          color={critical.length > 0 ? "red" : "green"}
          href="/dashboard/incidents"
          raw={total > 0 ? critical.length / total : 0}
        />
      </div>

      {/* ── Critical alert banner ── */}
      {critical.length > 0 && (
        <div
          className="fade-in"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 22px",
            background: "rgba(248,113,113,.07)",
            border: "1px solid rgba(248,113,113,.25)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <AlertCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
          <p style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>
            {critical.length} crítico{critical.length > 1 ? "s" : ""} —
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, overflow: "hidden" }}>
            {critical.slice(0, 2).map(c => (
              <Link
                key={c.id}
                href={`/dashboard/cases/${c.id}`}
                style={{ fontSize: ".8rem", color: "var(--red)", textDecoration: "underline", textDecorationColor: "rgba(248,113,113,.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {c.title}
              </Link>
            ))}
            {critical.length > 2 && (
              <Link href="/dashboard/incidents" className="hint" style={{ whiteSpace: "nowrap" }}>
                +{critical.length - 2} más
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Ticket queue ── */}
      <Card className="overflow-hidden fade-up d4">

        {/* Header */}
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="section-title">Todos los casos</span>
            <span className="count-badge">{total}</span>
            {/* Mini status pills */}
            {open > 0 && (
              <span className="meta-tag meta-tag--cyan">{open} abiertos</span>
            )}
            {inProg > 0 && (
              <span className="meta-tag meta-tag--amber">{inProg} en gestión</span>
            )}
            {withProv > 0 && (
              <span className="meta-tag meta-tag--purple">↗ {withProv} proveedor</span>
            )}
          </div>
          <Link href="/dashboard/cases" className="section-action">
            Ver todos <ExternalLink size={12} />
          </Link>
        </div>

        {/* Empty state */}
        {total === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
            <p style={{ fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Sin tickets activos</p>
            <p className="hint" style={{ marginBottom: 24 }}>Crea el primer caso para comenzar.</p>
            <Link href="/dashboard/cases/new" className="btn btn-cyan">+ Nuevo ticket</Link>
          </div>
        )}

        {/* Ticket rows */}
        {cases.map((c, i) => {
          const reqInitials  = c.requester.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
          const asgInitials  = c.assignedTo?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
          const catLabel     = c.category === "INCIDENT" ? "Incidente" : c.category === "REQUEST" ? "Solicitud" : "Cambio";
          const isLast       = i === cases.length - 1;

          return (
            <Link
              key={c.id}
              href={`/dashboard/cases/${c.id}`}
              className="ticket-row"
              data-priority={c.priority}
              style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
            >
              {/* Priority accent */}
              <div className="ticket-accent" data-priority={c.priority} />

              {/* Content */}
              <div className="ticket-body">

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {c.priority === "CRITICAL" && (
                      <span className="p-dot pulse" style={{ background: "var(--red)" }} />
                    )}
                    <p style={{ fontWeight: 600, fontSize: ".95rem", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {c.escalation && (
                      <span className="meta-tag meta-tag--purple">
                        ↗ {c.escalation.provider.name}
                      </span>
                    )}
                    <span className="hint" style={{ fontSize: ".78rem" }}>{c._count.updates} nota{c._count.updates !== 1 ? "s" : ""}</span>
                    <span className="hint" style={{ fontSize: ".78rem" }}>· {catLabel}</span>
                    {c.requester.department && (
                      <span className="hint" style={{ fontSize: ".78rem" }}>· {c.requester.department}</span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ flexShrink: 0 }}>
                  <StatusBadge status={c.status} />
                </div>

                {/* Requester avatar */}
                {user.role !== "REQUESTER" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, minWidth: 110 }}>
                    <div className="avatar avatar-sm avatar-slate" title={c.requester.name}>
                      {reqInitials}
                    </div>
                    <span style={{ fontSize: ".75rem", color: "var(--text-2)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.requester.name.split(" ")[0]}
                    </span>
                  </div>
                )}

                {/* Assignee avatar */}
                {c.assignedTo && asgInitials && (
                  <div className="avatar avatar-sm avatar-cyan" title={`Asignado: ${c.assignedTo.name}`}>
                    {asgInitials}
                  </div>
                )}

                {/* Time + date */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 52 }}>
                  {c.estimatedTime ? (
                    <p style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--cyan)" }}>{c.estimatedTime}h</p>
                  ) : null}
                  <p className="hint" style={{ fontSize: ".68rem" }}>
                    {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </p>
                </div>

                <ExternalLink size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
              </div>
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
