import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const where = user.role === "REQUESTER" ? { requesterId: user.id } : {};

  const cases = await prisma.case.findMany({
    where,
    include: {
      requester: { select: { name: true, department: true } },
      assignedTo: { select: { name: true } },
      escalation: { include: { provider: true } },
      _count: { select: { updates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = [
    { label: "Abiertos",     value: cases.filter(c => c.status === "OPEN").length,                         icon: "📋", bg: "#f1f5f9", color: "#0f172a", bar: "#94a3b8" },
    { label: "En gestión",   value: cases.filter(c => c.status === "IN_PROGRESS").length,                  icon: "⚙",  bg: "#eff6ff", color: "#1e40af", bar: "#3b82f6" },
    { label: "Con proveedor",value: cases.filter(c => c.status === "WAITING_PROVIDER").length,             icon: "🔗", bg: "#fefce8", color: "#78350f", bar: "#f59e0b" },
    { label: "Resueltos",    value: cases.filter(c => ["RESOLVED","CLOSED"].includes(c.status)).length,    icon: "✓",  bg: "#f0fdf4", color: "#14532d", bar: "#22c55e" },
  ];

  const total = cases.length || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de casos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cases.length === 0 ? "Sin casos registrados" : `${cases.length} caso${cases.length !== 1 ? "s" : ""} en total`}
          </p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="btn-press inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          }}
        >
          <span className="text-base">+</span> Nuevo caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-2xl p-5 animate-fade-in stagger-${i + 1} card-hover`}
            style={{ background: s.bg }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: s.color, opacity: 0.7 }}>
              {s.label}
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round((s.value / total) * 100)}%`, background: s.bar }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Cases list */}
      <div
        className="rounded-2xl overflow-hidden animate-fade-in stagger-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)" }}
      >
        {cases.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            style={{ background: "#fff" }}
          >
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-700 font-semibold text-lg">Sin casos aún</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Crea el primer caso usando el botón de arriba.</p>
            <Link
              href="/dashboard/cases/new"
              className="text-sm text-white font-semibold px-5 py-2 rounded-xl"
              style={{ background: "#1d4ed8" }}
            >
              + Crear primer caso
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm bg-white">
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["Caso", "Estado", "Prioridad", ...(user.role !== "REQUESTER" ? ["Solicitante"] : []), "Est.", "Fecha"].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#94a3b8", background: "#fafafa" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr
                  key={c.id}
                  className={`group transition-colors animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                  style={{ borderBottom: "1px solid #f8fafc" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/cases/${c.id}`} className="group/link">
                      <p className="font-semibold text-gray-800 group-hover/link:text-blue-700 transition-colors line-clamp-1">
                        {c.title}
                      </p>
                      {c.escalation && (
                        <span className="text-xs font-medium" style={{ color: "#d97706" }}>
                          ↗ {c.escalation.provider.name}
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c._count.updates} actualización{c._count.updates !== 1 ? "es" : ""}
                      </p>
                    </Link>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4"><PriorityBadge priority={c.priority} /></td>
                  {user.role !== "REQUESTER" && (
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">{c.requester.name}</p>
                      {c.requester.department && (
                        <p className="text-xs text-gray-400">{c.requester.department}</p>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    {c.estimatedTime ? `${c.estimatedTime}h` : "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
