import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import PageHeader from "@/components/PageHeader";
import { ExternalLink, Filter } from "lucide-react";

const STATUS_TABS = [
  { value: "",               label: "Todos"      },
  { value: "OPEN",          label: "Abiertos"   },
  { value: "IN_PROGRESS",   label: "En gestión" },
  { value: "WAITING_PROVIDER", label: "Proveedor" },
  { value: "RESOLVED",      label: "Resueltos"  },
  { value: "CLOSED",        label: "Cerrados"   },
];

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "var(--red)", HIGH: "var(--amber)",
  MEDIUM: "var(--sky)", LOW: "var(--text-3)",
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const statusFilter   = params.status   ?? "";
  const priorityFilter = params.priority ?? "";

  const where: Record<string, unknown> = user.role === "REQUESTER" ? { requesterId: user.id } : {};
  if (statusFilter)   where.status   = statusFilter;
  if (priorityFilter) where.priority = priorityFilter;

  const cases = await prisma.case.findMany({
    where,
    include: {
      requester:  { select: { name: true, department: true } },
      assignedTo: { select: { name: true } },
      escalation: { include: { provider: true } },
      _count:     { select: { updates: true } },
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  });

  const allCases = await prisma.case.findMany({
    where: user.role === "REQUESTER" ? { requesterId: user.id } : {},
    select: { status: true, priority: true },
  });

  const counts: Record<string, number> = { "": allCases.length };
  for (const c of allCases) {
    counts[c.status] = (counts[c.status] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-0">

      <PageHeader
        title="Tickets"
        subtitle={`${cases.length} resultado${cases.length !== 1 ? "s" : ""}${statusFilter ? ` · ${STATUS_TABS.find(t => t.value === statusFilter)?.label}` : ""}`}
        userName={user.name}
        userRole={user.role}
      />

      {/* ── Filter bar ── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", borderRadius: "var(--r-lg)", marginBottom: 16,
          background: "var(--surface-1)", border: "1px solid var(--border)",
        }}
      >
        {/* Status tabs */}
        <div className="flex items-center overflow-x-auto">
          {STATUS_TABS.map(tab => {
            const isActive = statusFilter === tab.value;
            const url = tab.value
              ? `/dashboard/cases?status=${tab.value}${priorityFilter ? `&priority=${priorityFilter}` : ""}`
              : `/dashboard/cases${priorityFilter ? `?priority=${priorityFilter}` : ""}`;
            return (
              <Link
                key={tab.value}
                href={url}
                style={{
                  position: "relative", display: "inline-block",
                  padding: "14px 20px", fontSize: ".88rem", fontWeight: 600,
                  whiteSpace: "nowrap", transition: "color .15s",
                  color: isActive ? "var(--cyan)" : "var(--text-3)",
                  textDecoration: "none",
                  borderBottom: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                }}
              >
                {tab.label}
                {counts[tab.value] !== undefined && (
                  <span
                    style={{
                      marginLeft: 7, padding: "1px 7px", borderRadius: 999, display: "inline-block",
                      background: isActive ? "var(--cyan-dim)" : "var(--surface-2)",
                      color: isActive ? "var(--cyan)" : "var(--text-3)",
                      fontSize: ".68rem", fontWeight: 700,
                    }}
                  >
                    {counts[tab.value]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Priority filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid var(--border)" }}>
          <Filter size={14} style={{ color: "var(--text-3)" }} />
          {["", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => {
            const isActive = priorityFilter === p;
            const label = p || "Todas";
            const url = p
              ? `/dashboard/cases?priority=${p}${statusFilter ? `&status=${statusFilter}` : ""}`
              : `/dashboard/cases${statusFilter ? `?status=${statusFilter}` : ""}`;
            return (
              <Link
                key={p}
                href={url}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, fontSize: ".82rem", fontWeight: 600,
                  textDecoration: "none", transition: "all .15s",
                  background: isActive ? (p ? `${PRIORITY_COLOR[p]}18` : "var(--surface-2)") : "transparent",
                  color: isActive ? (p ? PRIORITY_COLOR[p] : "var(--text-1)") : "var(--text-3)",
                  border: `1px solid ${isActive ? (p ? PRIORITY_COLOR[p] : "var(--border-md)") : "transparent"}`,
                }}
              >
                {p && <span style={{ width: 7, height: 7, borderRadius: 999, flexShrink: 0, background: PRIORITY_COLOR[p] }} />}
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden">
        {cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold text-base mb-1" style={{ color: "var(--text-2)" }}>Sin tickets</p>
            <p className="hint mb-6">No hay casos con los filtros actuales.</p>
            <Link href="/dashboard/cases/new" className="btn btn-cyan">+ Nuevo ticket</Link>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header row */}
            <div
              style={{
                display: "grid", padding: "12px 20px",
                gridTemplateColumns: user.role !== "REQUESTER"
                  ? "minmax(0,2fr) 140px 110px 170px 64px 100px 24px"
                  : "minmax(0,2fr) 140px 110px 64px 100px 24px",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
              }}
            >
              {["Título / Descripción", "Estado", "Prioridad",
                ...(user.role !== "REQUESTER" ? ["Solicitante"] : []),
                "Est.", "Creado", ""].map((h, i) => (
                <span key={i} className="hint uppercase tracking-widest" style={{ fontSize: ".68rem" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {cases.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/dashboard/cases/${c.id}`}
                  className="trow"
                  style={{
                    display: "grid", alignItems: "center", padding: "16px 20px",
                    gridTemplateColumns: user.role !== "REQUESTER"
                      ? "minmax(0,2.5fr) 140px 110px 170px 64px 100px 28px"
                      : "minmax(0,2.5fr) 140px 110px 64px 100px 28px",
                    borderBottom: i < cases.length - 1 ? "1px solid var(--border)" : "none",
                    textDecoration: "none",
                  }}
                >
                  {/* Title */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {c.priority === "CRITICAL" && (
                        <span className="pulse" style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: "var(--red)", display: "inline-block" }} />
                      )}
                      <p style={{ fontWeight: 600, fontSize: ".92rem", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </p>
                    </div>
                    <p className="hint" style={{ fontSize: ".76rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.escalation ? `↗ ${c.escalation.provider.name} · ` : ""}
                      {c._count.updates} nota{c._count.updates !== 1 ? "s" : ""}
                      {c.assignedTo ? ` · ${c.assignedTo.name}` : " · Sin asignar"}
                    </p>
                  </div>

                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />

                  {user.role !== "REQUESTER" && (
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: ".88rem", fontWeight: 500, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.requester.name}
                      </p>
                      {c.requester.department && (
                        <p className="hint" style={{ fontSize: ".74rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.requester.department}</p>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: ".88rem", fontWeight: 700, color: c.estimatedTime ? "var(--cyan)" : "var(--text-3)" }}>
                    {c.estimatedTime ? `${c.estimatedTime}h` : "—"}
                  </p>

                  <p className="hint" style={{ fontSize: ".76rem" }}>
                    {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </p>

                  <ExternalLink size={14} style={{ color: "var(--text-3)" }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
