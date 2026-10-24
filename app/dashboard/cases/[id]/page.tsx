import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CaseActions from "./CaseActions";

const categoryLabel: Record<string, string> = { INCIDENT: "Incidente", REQUEST: "Solicitud", CHANGE: "Cambio" };
const categoryIcon:  Record<string, string> = { INCIDENT: "🔥", REQUEST: "📋", CHANGE: "🔄" };

const roleColor: Record<string, { bg: string; color: string }> = {
  REQUESTER: { bg: "#eff6ff", color: "#1d4ed8" },
  ANALYST:   { bg: "#f0fdf4", color: "#15803d" },
  MANAGER:   { bg: "#fefce8", color: "#a16207" },
};

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

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Mis casos</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{c.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Case header card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.05)" }}
          >
            <div
              className="px-6 py-5 text-white"
              style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-xl font-bold leading-snug">{c.title}</h1>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#e0f2fe" }}
                >
                  {categoryIcon[c.category]} {categoryLabel[c.category] ?? c.category}
                </span>
                <PriorityBadge priority={c.priority} />
                {c.estimatedTime && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#e0f2fe" }}
                  >
                    ⏱ {c.estimatedTime}h estimadas
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white px-6 py-5">
              <p className="text-gray-600 text-sm leading-relaxed">{c.description}</p>
            </div>
          </div>

          {/* Escalation alert */}
          {c.escalation && (
            <div
              className="rounded-2xl p-5 animate-fade-in"
              style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 mb-2">Escalado a proveedor</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-amber-600 text-xs font-medium uppercase tracking-wide">Proveedor</p>
                      <p className="font-semibold text-amber-900">{c.escalation.provider.name}</p>
                    </div>
                    <div>
                      <p className="text-amber-600 text-xs font-medium uppercase tracking-wide">Tipo</p>
                      <p className="font-semibold text-amber-900">{c.escalation.provider.type}</p>
                    </div>
                    <div>
                      <p className="text-amber-600 text-xs font-medium uppercase tracking-wide">Enviado el</p>
                      <p className="font-semibold text-amber-900">{new Date(c.escalation.sentAt).toLocaleDateString("es-CO")}</p>
                    </div>
                    <div>
                      <p className="text-amber-600 text-xs font-medium uppercase tracking-wide">Estado</p>
                      <p className="font-semibold text-amber-900">{c.escalation.status}</p>
                    </div>
                  </div>
                  {c.escalation.notes && (
                    <p className="text-amber-700 text-sm mt-3 pt-3 border-t border-amber-200">
                      {c.escalation.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div
            className="bg-white rounded-2xl px-6 py-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">
              Historial · {c.updates.length} entrada{c.updates.length !== 1 ? "s" : ""}
            </h2>

            <div className="space-y-6">
              {c.updates.map((u, i) => {
                const rc = roleColor[u.author.role] ?? { bg: "#f1f5f9", color: "#475569" };
                const initials = u.author.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={u.id} className={`flex gap-4 animate-slide-in stagger-${Math.min(i + 1, 6)}`}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: rc.bg, color: rc.color }}
                      >
                        {initials}
                      </div>
                      {i < c.updates.length - 1 && (
                        <div className="w-px flex-1 mt-2" style={{ background: "#e2e8f0", minHeight: "16px" }} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{u.author.name}</span>
                        {u.newStatus && u.oldStatus !== u.newStatus && (
                          <StatusBadge status={u.newStatus} />
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(u.createdAt).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{u.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info card */}
          <div
            className="bg-white rounded-2xl px-6 py-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Detalles</h3>
            <div className="space-y-4">
              <InfoRow label="Creado" value={new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })} />
              <InfoRow label="Última actualización" value={new Date(c.updatedAt).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} />
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-1">Solicitante</p>
                <p className="text-sm font-semibold text-gray-800">{c.requester.name}</p>
                {c.requester.department && <p className="text-xs text-gray-500">{c.requester.department}</p>}
                {c.requester.phone && <p className="text-xs text-blue-600 mt-0.5">{c.requester.phone}</p>}
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-1">Asignado a</p>
                <p className="text-sm font-semibold text-gray-800">{c.assignedTo?.name ?? "Sin asignar"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
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
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
