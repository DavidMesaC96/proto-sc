import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CaseActions from "./CaseActions";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, email: true, department: true, phone: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      updates: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      escalation: { include: { provider: true } },
    },
  });

  if (!c) notFound();
  if (user.role === "REQUESTER" && c.requesterId !== user.id) redirect("/dashboard");

  const categoryLabel: Record<string, string> = {
    INCIDENT: "Incidente",
    REQUEST: "Solicitud",
    CHANGE: "Cambio",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-blue-700">Mis casos</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{c.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-gray-800">{c.title}</h1>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{c.description}</p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <PriorityBadge priority={c.priority} />
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                {categoryLabel[c.category] ?? c.category}
              </span>
              {c.estimatedTime && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                  ⏱ {c.estimatedTime}h estimadas
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Historial de actualizaciones</h2>
            <div className="space-y-4">
              {c.updates.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {u.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-800">{u.author.name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleString("es-CO")}
                      </span>
                      {u.newStatus && u.oldStatus !== u.newStatus && (
                        <span className="text-xs text-gray-400">
                          · <StatusBadge status={u.newStatus} />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{u.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Información del caso</h3>
            <InfoRow label="Creado" value={new Date(c.createdAt).toLocaleDateString("es-CO")} />
            <InfoRow label="Actualizado" value={new Date(c.updatedAt).toLocaleDateString("es-CO")} />
            <InfoRow label="Solicitante" value={c.requester.name} />
            {c.requester.department && <InfoRow label="Área" value={c.requester.department} />}
            {c.requester.phone && <InfoRow label="Teléfono" value={c.requester.phone} />}
            <InfoRow label="Asignado a" value={c.assignedTo?.name ?? "Sin asignar"} />
          </div>

          {/* Escalation */}
          {c.escalation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-yellow-800 text-sm">Escalado a proveedor</h3>
              <InfoRow label="Proveedor" value={c.escalation.provider.name} />
              <InfoRow label="Tipo" value={c.escalation.provider.type} />
              <InfoRow label="Enviado" value={new Date(c.escalation.sentAt).toLocaleDateString("es-CO")} />
              <InfoRow label="Estado" value={c.escalation.status} />
              {c.escalation.notes && <InfoRow label="Notas" value={c.escalation.notes} />}
            </div>
          )}

          {/* Actions for analysts/managers */}
          {user.role !== "REQUESTER" && (
            <CaseActions
              caseId={c.id}
              currentStatus={c.status}
              hasEscalation={!!c.escalation}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-700 font-medium">{value}</p>
    </div>
  );
}
