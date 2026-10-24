import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

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
    orderBy: { updatedAt: "desc" },
  });

  const open     = cases.filter(c => c.status === "OPEN").length;
  const inProg   = cases.filter(c => c.status === "IN_PROGRESS").length;
  const withProv = cases.filter(c => c.status === "WAITING_PROVIDER").length;
  const resolved = cases.filter(c => ["RESOLVED","CLOSED"].includes(c.status)).length;

  const metrics = [
    { label: "Abiertos",       value: open,     dot: "#94A3B8", bg: "#F8FAFC" },
    { label: "En gestión",     value: inProg,   dot: "#5B4FE8", bg: "#EEF0FF" },
    { label: "Con proveedor",  value: withProv, dot: "#F59E0B", bg: "#FFFBEB" },
    { label: "Resueltos",      value: resolved, dot: "#22C55E", bg: "#F0FDF4" },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 anim-up">
        <div>
          <h1 className="font-bold text-2xl" style={{ color: "var(--text-1)" }}>
            {user.role === "REQUESTER" ? "Mis solicitudes" : "Cola de soporte"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            {cases.length === 0
              ? "Sin casos registrados aún"
              : `${cases.length} caso${cases.length !== 1 ? "s" : ""} · última actualización hace unos momentos`}
          </p>
        </div>
        <Link href="/dashboard/cases/new" className="btn btn-primary anim-up d1">
          + Nuevo caso
        </Link>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`card p-5 anim-up d${i + 1}`}
            style={{ background: m.bg, border: "none" }}
          >
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--text-1)" }}>{m.value}</p>
            <div className="flex items-center gap-1.5">
              <span className="dot" style={{ background: m.dot }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cases ── */}
      {cases.length === 0 ? (
        <div
          className="card flex flex-col items-center py-20 text-center anim-up d3"
        >
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>Sin casos todavía</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>Crea el primer caso y empieza a dar soporte.</p>
          <Link href="/dashboard/cases/new" className="btn btn-primary">+ Crear primer caso</Link>
        </div>
      ) : (
        <div className="card overflow-hidden anim-up d3">
          {/* Table head */}
          <div
            className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
            style={{
              color: "var(--text-3)",
              borderBottom: "1px solid var(--border)",
              gridTemplateColumns: user.role !== "REQUESTER"
                ? "2fr 140px 90px 140px 70px 80px"
                : "2fr 140px 90px 70px 80px",
            }}
          >
            <span>Caso</span>
            <span>Estado</span>
            <span>Prioridad</span>
            {user.role !== "REQUESTER" && <span>Solicitante</span>}
            <span>Est.</span>
            <span>Fecha</span>
          </div>

          {/* Rows */}
          <div>
            {cases.map((c, i) => (
              <Link
                key={c.id}
                href={`/dashboard/cases/${c.id}`}
                className={`case-row grid items-center px-5 py-4 transition-colors anim-up d${Math.min(i + 2, 6)}`}
                style={{
                  gridTemplateColumns: user.role !== "REQUESTER"
                    ? "2fr 140px 90px 140px 70px 80px"
                    : "2fr 140px 90px 70px 80px",
                  borderBottom: i < cases.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                  display: "grid",
                }}
              >
                {/* Title */}
                <div style={{ minWidth: 0 }}>
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--text-1)" }}
                  >
                    {c.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.escalation && (
                      <span className="text-xs font-medium" style={{ color: "var(--amber)" }}>
                        ↗ {c.escalation.provider.name}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>
                      {c._count.updates} nota{c._count.updates !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div><StatusBadge status={c.status} /></div>
                <div><PriorityBadge priority={c.priority} /></div>

                {user.role !== "REQUESTER" && (
                  <div>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                      {c.requester.name}
                    </p>
                    {c.requester.department && (
                      <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                        {c.requester.department}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  {c.estimatedTime ? `${c.estimatedTime}h` : "—"}
                </div>

                <div className="text-xs" style={{ color: "var(--text-3)" }}>
                  {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
