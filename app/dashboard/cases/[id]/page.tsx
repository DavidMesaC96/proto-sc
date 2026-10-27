import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CaseActions from "./CaseActions";
import PageHeader from "@/components/PageHeader";
import {
  Zap, FileText, RefreshCw, Clock, Building2, Phone, CalendarDays, Link2, ArrowRight, MessageSquare,
} from "lucide-react";

const CAT: Record<string, { label: string; Icon: React.ElementType }> = {
  INCIDENT: { label: "Incidente",  Icon: Zap       },
  REQUEST:  { label: "Solicitud",  Icon: FileText   },
  CHANGE:   { label: "Cambio",     Icon: RefreshCw  },
};

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  REQUESTER: { bg: "var(--sky-dim)",   color: "var(--sky)",   label: "Usuario"     },
  ANALYST:   { bg: "var(--green-dim)", color: "var(--green)", label: "Analista"    },
  MANAGER:   { bg: "var(--amber-dim)", color: "var(--amber)", label: "Responsable" },
};

const ESC_STATUS: Record<string, string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En curso", RESOLVED: "Resuelto",
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

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
  const elapsedHours = (new Date().getTime() - c.createdAt.getTime()) / 36e5;
  const created = new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }).replace(/ de /g, " ");

  return (
    <div className="fade-up">
      <PageHeader
        title={c.title}
        subtitle={`Dashboard › Tickets › detalle`}
        userName={user.name}
        userRole={user.role}
        showNewTicket={false}
      />

      <div className="cd-grid">

        {/* ═════ Izquierda: metadatos y personas ═════ */}
        <div className="cd-col">
          <div className="cd-card">
            <p className="cd-cap">Detalles</p>
            <div className="cd-wrap" style={{ marginTop: 14 }}>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
              {cat && (
                <span className="cd-chip"><cat.Icon size={12} /> {cat.label}</span>
              )}
            </div>

            <div className="cd-tiles">
              <div className="cd-tile">
                <p className="cd-cap cd-row" style={{ gap: 5 }}><CalendarDays size={11} /> Creado</p>
                <p>{created}</p>
              </div>
              <div className="cd-tile">
                <p className="cd-cap cd-row" style={{ gap: 5 }}><Clock size={11} /> Estimado</p>
                <p style={{ color: "var(--green)" }}>{c.estimatedTime ? `${c.estimatedTime} h` : "—"}</p>
              </div>
            </div>

            <div className="cd-id">
              <span className="cd-cap">ID del ticket</span>
              <code>{c.id}</code>
            </div>
          </div>

          <div className="cd-card">
            <p className="cd-cap">Solicitante</p>
            <div className="cd-person">
              <span className="cd-av" style={{ background: "var(--sky-dim)", color: "var(--sky)" }}>
                {initials(c.requester.name)}
              </span>
              <div style={{ minWidth: 0 }}>
                <p className="cd-name">{c.requester.name}</p>
                <p className="cd-sub">{c.requester.email}</p>
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              {c.requester.department && <div className="cd-info"><Building2 size={14} /> {c.requester.department}</div>}
              {c.requester.phone && <div className="cd-info"><Phone size={14} /> {c.requester.phone}</div>}
            </div>
          </div>

          <div className="cd-card">
            <p className="cd-cap">Asignado a</p>
            {c.assignedTo ? (
              <div className="cd-person">
                <span className="cd-av" style={{ background: "var(--green-dim)", color: "var(--green)" }}>
                  {initials(c.assignedTo.name)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p className="cd-name">{c.assignedTo.name}</p>
                  <p className="cd-sub">{c.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <div className="cd-person">
                <span className="cd-av" style={{ background: "var(--surface-2)", color: "var(--text-3)" }}>?</span>
                <p className="cd-name" style={{ color: "var(--text-3)", fontWeight: 600 }}>Sin asignar</p>
              </div>
            )}
          </div>
        </div>

        {/* ═════ Centro: descripción, escalamiento, actividad ═════ */}
        <div className="cd-col">
          <div className="cd-card cd-hero">
            <div className="cd-hero-bar" />
            <div className="cd-hero-body">
              <p className="cd-cap">Descripción del caso</p>
              <h1 className="cd-title">{c.title}</h1>
              <p className="cd-desc">{c.description}</p>
            </div>
          </div>

          {c.escalation && (
            <div className="cd-esc fade-in">
              <div className="cd-row" style={{ gap: 14 }}>
                <span className="cd-esc-ico"><Link2 size={18} /></span>
                <div>
                  <p style={{ fontSize: ".95rem", fontWeight: 800, color: "#B45309" }}>Escalado a proveedor</p>
                  <p style={{ fontSize: ".76rem", color: "var(--text-3)" }}>
                    {c.escalation.provider.name} · {c.escalation.provider.type}
                  </p>
                </div>
              </div>

              <div className="cd-esc-grid">
                {[
                  ["Proveedor", c.escalation.provider.name],
                  ["Tipo",      c.escalation.provider.type],
                  ["Enviado",   new Date(c.escalation.sentAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })],
                  ["Estado",    ESC_STATUS[c.escalation.status] ?? c.escalation.status],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="cd-cap">{k}</p>
                    <p>{v}</p>
                  </div>
                ))}
              </div>

              {c.escalation.notes && <p className="cd-quote">{c.escalation.notes}</p>}
            </div>
          )}

          <div className="cd-card" style={{ padding: 28 }}>
            <div className="cd-row" style={{ justifyContent: "space-between" }}>
              <p className="cd-cap">Actividad</p>
              <span className="cd-chip">
                <MessageSquare size={12} /> {c.updates.length} entrada{c.updates.length !== 1 ? "s" : ""}
              </span>
            </div>

            {c.updates.length === 0 ? (
              <div className="cd-empty">Todavía no hay actividad registrada en este caso.</div>
            ) : (
              <div className="cd-tl">
                {c.updates.map((u, i) => {
                  const rs = ROLE_STYLE[u.author.role] ?? { bg: "var(--surface-2)", color: "var(--text-2)", label: u.author.role };
                  const moved = u.newStatus && u.oldStatus !== u.newStatus && (u.oldStatus || i === 0);
                  return (
                    <div key={u.id} className={`cd-tl-item slide-r d${Math.min(i + 1, 6)}`}>
                      <span className="cd-tl-av" style={{ background: rs.bg, color: rs.color }}>
                        {initials(u.author.name)}
                      </span>
                      <div className="cd-tl-main">
                        <div className="cd-tl-head">
                          <span style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-1)" }}>{u.author.name}</span>
                          <span className="cd-role" style={{ background: rs.bg, color: rs.color }}>{rs.label}</span>
                          <span className="cd-time">
                            {new Date(u.createdAt).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {moved && (
                          <div className="cd-move">
                            {u.oldStatus && <><StatusBadge status={u.oldStatus} /><ArrowRight size={13} style={{ color: "var(--text-3)" }} /></>}
                            <StatusBadge status={u.newStatus!} />
                          </div>
                        )}
                        <p className="cd-bubble">{u.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═════ Derecha: gestión ═════ */}
        <div>
          {user.role !== "REQUESTER" && (
            <CaseActions
              caseId={c.id}
              currentStatus={c.status}
              priority={c.priority}
              estimatedHours={c.estimatedTime}
              elapsedHours={elapsedHours}
              assignedToName={c.assignedTo?.name ?? null}
              hasEscalation={!!c.escalation}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
