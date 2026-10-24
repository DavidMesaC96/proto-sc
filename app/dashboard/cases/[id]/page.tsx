import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CaseActions from "./CaseActions";

const CAT_LABEL: Record<string, string> = { INCIDENT: "Incidente", REQUEST: "Solicitud", CHANGE: "Cambio" };
const CAT_ICON:  Record<string, string> = { INCIDENT: "⚡", REQUEST: "📋", CHANGE: "🔁" };

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  REQUESTER: { bg: "#EEF0FF", color: "#5B4FE8" },
  ANALYST:   { bg: "#F0FDF4", color: "#16A34A" },
  MANAGER:   { bg: "#FFFBEB", color: "#D97706" },
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      requester:  { select: { id: true, name: true, email: true, department: true, phone: true } },
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
    <div className="anim-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-3)" }}>
        <Link href="/dashboard" className="bc-link" style={{ color: "var(--text-3)", textDecoration: "none" }}>
          Soporte
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs" style={{ color: "var(--text-1)", fontWeight: 500 }}>{c.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Main ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Case card */}
          <div className="card overflow-hidden">
            <div className="px-7 py-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="font-bold text-xl leading-snug" style={{ color: "var(--text-1)" }}>
                  {c.title}
                </h1>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                >
                  {CAT_ICON[c.category]} {CAT_LABEL[c.category] ?? c.category}
                </span>
                <PriorityBadge priority={c.priority} />
                {c.estimatedTime && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                  >
                    ⏱ {c.estimatedTime}h estimadas
                  </span>
                )}
              </div>
            </div>
            <div className="px-7 py-5">
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                {c.description}
              </p>
            </div>
          </div>

          {/* Escalation notice */}
          {c.escalation && (
            <div
              className="card px-6 py-5 anim-up d1"
              style={{ border: "1px solid #FDE68A", background: "var(--amber-lt)" }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">🔗</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-3" style={{ color: "#92400E" }}>
                    Escalado a proveedor externo
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      ["Proveedor",  c.escalation.provider.name],
                      ["Tipo",       c.escalation.provider.type],
                      ["Enviado",    new Date(c.escalation.sentAt).toLocaleDateString("es-CO")],
                      ["Estado",     c.escalation.status],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#B45309" }}>{k}</p>
                        <p className="text-sm font-semibold" style={{ color: "#78350F" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {c.escalation.notes && (
                    <p className="text-sm mt-4 pt-4" style={{ color: "#92400E", borderTop: "1px solid #FDE68A" }}>
                      {c.escalation.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card px-7 py-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-3)" }}>
              Actividad · {c.updates.length} entrada{c.updates.length !== 1 ? "s" : ""}
            </p>

            <div className="space-y-6">
              {c.updates.map((u, i) => {
                const rc       = ROLE_COLOR[u.author.role] ?? { bg: "#F1F5F9", color: "#64748B" };
                const initials = u.author.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                const isLast   = i === c.updates.length - 1;
                return (
                  <div key={u.id} className={`flex gap-4 anim-left d${Math.min(i + 1, 6)}`}>
                    {/* Avatar + connector */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: rc.bg, color: rc.color }}
                      >
                        {initials}
                      </div>
                      {!isLast && (
                        <div
                          className="flex-1 w-px mt-2"
                          style={{ background: "var(--border)", minHeight: "20px" }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                          {u.author.name}
                        </span>
                        {u.newStatus && u.oldStatus !== u.newStatus && (
                          <StatusBadge status={u.newStatus} />
                        )}
                        <span className="text-xs ml-auto" style={{ color: "var(--text-3)" }}>
                          {new Date(u.createdAt).toLocaleString("es-CO", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed px-4 py-3 rounded-xl"
                        style={{ background: "var(--bg)", color: "var(--text-2)" }}
                      >
                        {u.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Details */}
          <div className="card px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
              Detalles del caso
            </p>
            <div className="space-y-4">
              <Detail label="Creado"
                value={new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })} />
              <Detail label="Actualizado"
                value={new Date(c.updatedAt).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} />

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>
                  Solicitante
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{c.requester.name}</p>
                {c.requester.department && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{c.requester.department}</p>
                )}
                {c.requester.phone && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>{c.requester.phone}</p>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>
                  Asignado a
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                  {c.assignedTo?.name ?? "Sin asignar"}
                </p>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{value}</p>
    </div>
  );
}
