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

  const stats = {
    open: cases.filter((c) => c.status === "OPEN").length,
    inProgress: cases.filter((c) => c.status === "IN_PROGRESS").length,
    waitingProvider: cases.filter((c) => c.status === "WAITING_PROVIDER").length,
    resolved: cases.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mis casos</h1>
        <Link
          href="/dashboard/cases/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          + Nuevo caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Abiertos", value: stats.open, color: "text-gray-700 bg-gray-100" },
          { label: "En gestión", value: stats.inProgress, color: "text-blue-700 bg-blue-50" },
          { label: "Con proveedor", value: stats.waitingProvider, color: "text-yellow-700 bg-yellow-50" },
          { label: "Resueltos", value: stats.resolved, color: "text-green-700 bg-green-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cases table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {cases.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg">No hay casos registrados</p>
            <p className="text-sm mt-1">Crea el primero usando el botón de arriba.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Caso</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Prioridad</th>
                {user.role !== "REQUESTER" && (
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Solicitante</th>
                )}
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tiempo est.</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {c.title}
                    </Link>
                    {c.escalation && (
                      <span className="ml-2 text-xs text-yellow-600 font-medium">
                        ↗ {c.escalation.provider.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  {user.role !== "REQUESTER" && (
                    <td className="px-4 py-3 text-gray-600">
                      {c.requester.name}
                      {c.requester.department && (
                        <span className="text-gray-400 text-xs ml-1">· {c.requester.department}</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-500">
                    {c.estimatedTime ? `${c.estimatedTime}h` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString("es-CO")}
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
