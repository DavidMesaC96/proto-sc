import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CaseActions from "./CaseActions";
import PageHeader from "@/components/PageHeader";
import { ChevronRight, Zap, FileText, RefreshCw, Clock, Building2 } from "lucide-react";

const CAT: Record<string, { label: string; Icon: React.ElementType }> = {
  INCIDENT: { label: "Incidente",  Icon: Zap       },
  REQUEST:  { label: "Solicitud",  Icon: FileText   },
  CHANGE:   { label: "Cambio",     Icon: RefreshCw  },
};

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  REQUESTER: { bg: "var(--sky-dim)",   color: "var(--sky)"   },
  ANALYST:   { bg: "var(--green-dim)", color: "var(--green)" },
  MANAGER:   { bg: "var(--amber-dim)", color: "var(--amber)" },
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

  const cat = CAT[c.category];

  return (
    <div className="fade-up">
      <PageHeader
        title={c.title}
        subtitle={`Dashboard › Tickets › detalle`}
        userName={user.name}
        userRole={user.role}
        showNewTicket={false}
      />

      {/* 3-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 300px", gap: 20, alignItems: "start" }}>

        {/* ── Left: metadata & actions ── */}
        <div className="space-y-4">
          {/* Case meta */}
          <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <p className="hint uppercase tracking-widest mb-3" style={{ fontSize: ".7rem" }}>Detalles</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>
              {cat && (
                <div className="flex items-center gap-1.5 mb-3" style={{ color: "var(--text-3)" }}>
                  <cat.Icon size={12} />
                  <span className="hint">{cat.label}</span>
                </div>
              )}
              <div style={{
                background: "rgba(0,43,122,.04)",
                border: "1px solid rgba(0,43,122,.08)",
                borderRadius: 8,
                padding: "8px 10px",
              }}>
                <p className="hint" style={{ fontSize: ".62rem", marginBottom: 3 }}>ID DEL TICKET</p>
                <p style={{
                  fontFamily: "monospace",
                  fontSize: ".72rem",
                  color: "var(--text-2)",
                  wordBreak: "break-all",
                  lineHeight: 1.4,
                }}>{c.id}</p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                <span className="hint" style={{ fontSize: ".68rem" }}>CREADO</span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                {new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>

            {c.estimatedTime && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <p className="hint mb-1" style={{ fontSize: ".68rem" }}>TIEMPO EST.</p>
                <p className="text-sm font-bold" style={{ color: "var(--cyan)" }}>{c.estimatedTime}h</p>
              </div>
            )}
          </div>

          {/* Requester */}
          <div className="glass-card" style={{ padding: 24 }}>
            <p className="hint uppercase tracking-widest mb-4" style={{ fontSize: ".7rem" }}>Solicitante</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, background: "var(--cyan-dim)", color: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".82rem" }}
              >
                {c.requester.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)" }}>{c.requester.name}</p>
                <p className="hint" style={{ fontSize: ".76rem" }}>{c.requester.email}</p>
              </div>
            </div>
            {c.requester.department && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Building2 size={13} style={{ color: "var(--text-3)" }} />
                <span className="hint" style={{ fontSize: ".82rem" }}>{c.requester.department}</span>
              </div>
            )}
            {c.requester.phone && (
              <p className="hint" style={{ marginTop: 6, fontSize: ".82rem", color: "var(--cyan)" }}>{c.requester.phone}</p>
            )}
          </div>

          {/* Assignee */}
          <div className="glass-card" style={{ padding: 24 }}>
            <p className="hint uppercase tracking-widest mb-4" style={{ fontSize: ".7rem" }}>Asignado a</p>
            {c.assignedTo ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: "var(--green-dim)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".76rem" }}
                >
                  {c.assignedTo.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <p style={{ fontSize: ".92rem", fontWeight: 600, color: "var(--text-1)" }}>{c.assignedTo.name}</p>
              </div>
            ) : (
              <p className="hint" style={{ fontSize: ".88rem" }}>Sin asignar</p>
            )}
          </div>
        </div>

        {/* ── Center: description + timeline ── */}
        <div className="space-y-4">
          {/* Description */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h1 style={{ fontWeight: 900, fontSize: "1.35rem", letterSpacing: "-.02em", lineHeight: 1.2, color: "var(--text-1)", marginBottom: 12 }}>{c.title}</h1>
            <p style={{ fontSize: ".92rem", lineHeight: 1.7, color: "var(--text-2)" }}>{c.description}</p>
          </div>

          {/* Escalation */}
          {c.escalation && (
            <div
              className="glass-card fade-in"
              style={{ padding: 20, border: "1px solid rgba(245,158,11,.3)", background: "var(--amber-dim)" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">🔗</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-3" style={{ color: "var(--amber)" }}>
                    Escalado a proveedor
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Proveedor", c.escalation.provider.name],
                      ["Tipo",      c.escalation.provider.type],
                      ["Enviado",   new Date(c.escalation.sentAt).toLocaleDateString("es-CO")],
                      ["Estado",    c.escalation.status],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="hint mb-0.5" style={{ fontSize: ".65rem" }}>{k}</p>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {c.escalation.notes && (
                    <p className="text-sm mt-3 pt-3" style={{ color: "var(--text-2)", borderTop: "1px solid rgba(245,158,11,.2)" }}>
                      {c.escalation.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity feed */}
          <div className="glass-card" style={{ padding: 28 }}>
            <p className="hint uppercase tracking-widest" style={{ fontSize: ".7rem", marginBottom: 22 }}>
              Actividad · {c.updates.length} entrada{c.updates.length !== 1 ? "s" : ""}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {c.updates.map((u, i) => {
                const rs = ROLE_STYLE[u.author.role] ?? { bg: "var(--surface-2)", color: "var(--text-2)" };
                const initials = u.author.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={u.id} className={`slide-r d${Math.min(i + 1, 6)}`} style={{ display: "flex", gap: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div
                        style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: rs.bg, color: rs.color, fontSize: ".72rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {initials}
                      </div>
                      {i < c.updates.length - 1 && (
                        <div style={{ width: 1, flex: 1, marginTop: 6, background: "var(--border)", minHeight: 16 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)" }}>
                          {u.author.name}
                        </span>
                        {u.newStatus && u.oldStatus !== u.newStatus && <StatusBadge status={u.newStatus} />}
                        <span className="hint" style={{ marginLeft: "auto", fontSize: ".76rem" }}>
                          {new Date(u.createdAt).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p
                        style={{ fontSize: ".88rem", lineHeight: 1.65, padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)", color: "var(--text-2)" }}
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

        {/* ── Right: actions ── */}
        <div>
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
