"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, AlertTriangle, MessageSquare, UserCog, Link2, Lock,
  Send, Timer, Search, Sparkles,
} from "lucide-react";

interface Props {
  caseId: string;
  currentStatus: string;
  priority: string;
  assignedToName: string | null;
  estimatedHours: number | null;
  elapsedHours: number;
  hasEscalation: boolean;
  userId: string;
}
interface Provider { id: string; name: string; type: string; }
type TabId = "update" | "assign" | "escalate" | "close";

const MAX_COMMENT = 500;

const STATUSES = [
  { value: "OPEN",         label: "Abierto",   long: "Abierto",      color: "#6B7280" },
  { value: "IN_PROGRESS",  label: "Gestión",   long: "En gestión",   color: "#3B82F6" },
  { value: "WAITING_USER", label: "Espera",    long: "Esp. usuario", color: "#F59E0B" },
  { value: "RESOLVED",     label: "Resuelto",  long: "Resuelto",     color: "#10B981" },
  { value: "CLOSED",       label: "Cerrado",   long: "Cerrado",      color: "#64748B" },
];
const STATUS_BY_VALUE: Record<string, { long: string; color: string }> = {
  ...Object.fromEntries(STATUSES.map(s => [s.value, s])),
  WAITING_PROVIDER: { long: "Con proveedor", color: "#8B5CF6" },
};

const PRIORITY: Record<string, { label: string; color: string }> = {
  LOW:      { label: "Baja",    color: "#9CA3AF" },
  MEDIUM:   { label: "Media",   color: "#60A5FA" },
  HIGH:     { label: "Alta",    color: "#FBBF24" },
  CRITICAL: { label: "Crítica", color: "#F87171" },
};

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "update",   label: "Gestión", Icon: MessageSquare },
  { id: "assign",   label: "Asignar", Icon: UserCog },
  { id: "escalate", label: "Escalar", Icon: Link2 },
  { id: "close",    label: "Cerrar",  Icon: Lock },
];

const QUICK_NOTES = [
  "Contacté al usuario",
  "Revisando logs",
  "Se requiere más información",
  "Solución aplicada",
];

const INK  = "#002B7A";
const CAP: React.CSSProperties = {
  fontSize: ".64rem", fontWeight: 700, letterSpacing: ".09em",
  textTransform: "uppercase", color: "var(--text-3)",
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatHours(h: number) {
  const a = Math.abs(h);
  if (a < 1) return `${Math.max(1, Math.round(a * 60))} min`;
  if (a < 48) return `${Math.round(a)} h`;
  return `${Math.round(a / 24)} d`;
}

export default function CaseActions({
  caseId, currentStatus, priority, assignedToName, estimatedHours, elapsedHours, hasEscalation,
}: Props) {
  const router = useRouter();
  const [tab,        setTab]       = useState<TabId>("update");
  const [status,     setStatus]    = useState(currentStatus);
  const [message,    setMessage]   = useState("");
  const [providers,  setProviders] = useState<Provider[]>([]);
  const [provQuery,  setProvQuery] = useState("");
  const [provId,     setProvId]    = useState("");
  const [notes,      setNotes]     = useState("");
  const [loading,    setLoading]   = useState(false);
  const [feedback,   setFeedback]  = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => { fetch("/api/providers").then(r => r.json()).then(setProviders); }, []);

  function flash(ok: boolean, msg: string) {
    setFeedback({ ok, msg });
    setTimeout(() => { setFeedback(null); if (ok) router.refresh(); }, 1500);
  }

  async function saveUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { flash(false, "Escribe un comentario"); return; }
    setLoading(true);
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, message }),
    });
    setLoading(false);
    if (!res.ok) { flash(false, "Error al actualizar"); return; }
    setMessage(""); flash(true, "Actualizado");
  }

  async function saveEscalate(e: React.FormEvent) {
    e.preventDefault();
    if (!provId) { flash(false, "Selecciona un proveedor"); return; }
    setLoading(true);
    const res = await fetch(`/api/cases/${caseId}/escalate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId: provId, notes }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { flash(false, data.error || "Error"); return; }
    flash(true, "Escalado correctamente");
  }

  function addQuickNote(text: string) {
    setMessage(m => {
      const next = m.trim() ? `${m.trim()} ${text}.` : `${text}.`;
      return next.slice(0, MAX_COMMENT);
    });
  }

  const st   = STATUS_BY_VALUE[currentStatus] ?? { long: currentStatus, color: "#9CA3AF" };
  const pr   = PRIORITY[priority] ?? { label: priority, color: "#9CA3AF" };
  const open = currentStatus !== "RESOLVED" && currentStatus !== "CLOSED";

  // Barra de tiempo de atención
  const ratio    = estimatedHours ? elapsedHours / estimatedHours : 0;
  const slaColor = ratio >= 1 ? "#F87171" : ratio >= 0.6 ? "#FBBF24" : "#34D399";
  const slaText  = !estimatedHours ? null
    : ratio >= 1 ? `Vencido hace ${formatHours(elapsedHours - estimatedHours)}`
    : `Quedan ${formatHours(estimatedHours - elapsedHours)}`;

  const tabIndex   = TABS.findIndex(t => t.id === tab);
  const statusIdx  = STATUSES.findIndex(s => s.value === status);
  const filtered   = providers.filter(p =>
    `${p.name} ${p.type}`.toLowerCase().includes(provQuery.trim().toLowerCase()));
  const pct        = Math.min(message.length / MAX_COMMENT, 1);

  return (
    <div className="ca-panel">
      {/* ═════ Cabecera ═════ */}
      <div className="ca-head">
        <div className="ca-row ca-between" style={{ marginBottom: 14 }}>
          <span style={{ ...CAP, color: "rgba(255,255,255,.6)" }}>Gestión del ticket</span>
          <span className="ca-chip" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
            <span className="p-dot" style={{ background: pr.color }} /> {pr.label}
          </span>
        </div>

        <div className="ca-row ca-g8" style={{ marginBottom: 16 }}>
          <span className="p-dot" style={{ background: st.color, width: 9, height: 9, boxShadow: `0 0 0 4px ${st.color}33` }} />
          <span style={{ fontSize: "1.18rem", fontWeight: 800, letterSpacing: "-.01em", color: "#fff" }}>{st.long}</span>
        </div>

        <div className="ca-row ca-g10">
          {assignedToName ? (
            <span className="ca-avatar">{initials(assignedToName)}</span>
          ) : (
            <span className="ca-avatar" style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)" }}>?</span>
          )}
          <div style={{ lineHeight: 1.25 }}>
            <p style={{ fontSize: ".64rem", color: "rgba(255,255,255,.55)", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Asignado a
            </p>
            <p style={{ fontSize: ".88rem", fontWeight: 700, color: assignedToName ? "#fff" : "rgba(255,255,255,.6)" }}>
              {assignedToName ?? "Sin asignar"}
            </p>
          </div>
        </div>

        {estimatedHours && open && (
          <div style={{ marginTop: 18 }}>
            <div className="ca-row ca-between" style={{ marginBottom: 7 }}>
              <span className="ca-row ca-g6" style={{ fontSize: ".7rem", color: "rgba(255,255,255,.7)" }}>
                <Timer size={12} /> Tiempo de atención · {formatHours(elapsedHours)} de {estimatedHours} h
              </span>
              <span style={{ fontSize: ".7rem", fontWeight: 700, color: slaColor }}>{slaText}</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(ratio, 1) * 100}%`, height: "100%", borderRadius: 99, background: slaColor, transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </div>
        )}
      </div>

      {/* ═════ Selector segmentado ═════ */}
      <div style={{ padding: "14px 14px 0" }}>
        <div className="ca-seg" role="tablist">
          <span className="ca-seg-ind" style={{ transform: `translateX(${tabIndex * 100}%)` }} />
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id} type="button" role="tab" aria-selected={tab === id}
              onClick={() => { setTab(id); setFeedback(null); }}
              className="ca-seg-btn" data-on={tab === id}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* ═════ Gestión ═════ */}
        {tab === "update" && (
          <form onSubmit={saveUpdate} className="ca-form fade-in">
            <div>
              <p style={{ ...CAP, marginBottom: 12 }}>Mover a</p>
              {statusIdx < 0 && (
                <p style={{ fontSize: ".74rem", color: "var(--text-3)", marginBottom: 12 }}>
                  El caso está en «{st.long}». Elige un estado para moverlo.
                </p>
              )}
              <div className="ca-steps">
                <span className="ca-steps-line" />
                <span className="ca-steps-fill" style={{ width: `${(Math.max(statusIdx, 0) / (STATUSES.length - 1)) * 100}%` }} />
                {STATUSES.map((s, i) => {
                  const reached = i <= statusIdx;
                  const on = status === s.value;
                  return (
                    <button
                      key={s.value} type="button" onClick={() => setStatus(s.value)}
                      className="ca-step" data-on={on} aria-pressed={on}
                    >
                      <span className="ca-step-dot" style={{
                        background: reached ? s.color : "#fff",
                        borderColor: reached ? s.color : "var(--border-hi)",
                        boxShadow: on ? `0 0 0 5px ${s.color}26` : "none",
                      }}>
                        {on && <CheckCircle2 size={11} color="#fff" strokeWidth={3} />}
                      </span>
                      <span style={{ color: on ? s.color : "var(--text-3)", fontWeight: on ? 800 : 600 }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="ca-row ca-between" style={{ marginBottom: 8 }}>
                <p style={CAP}>Nota de seguimiento <span style={{ color: "var(--red)" }}>*</span></p>
                <span className="ca-row ca-g6" style={{ fontSize: ".66rem", color: "var(--text-3)" }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
                    <circle cx="10" cy="10" r="8" fill="none" stroke="var(--surface-3)" strokeWidth="2.5" />
                    <circle cx="10" cy="10" r="8" fill="none" strokeWidth="2.5" strokeLinecap="round"
                      stroke={pct > 0.9 ? "var(--red)" : INK}
                      strokeDasharray={`${pct * 50.27} 50.27`} transform="rotate(-90 10 10)"
                      style={{ transition: "stroke-dasharray .2s" }} />
                  </svg>
                  {message.length}/{MAX_COMMENT}
                </span>
              </div>

              <div className="ca-composer">
                <textarea
                  rows={5} value={message} maxLength={MAX_COMMENT}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe la acción realizada, el hallazgo o lo que necesitas del usuario…"
                />
                <div className="ca-quick">
                  <Sparkles size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  {QUICK_NOTES.map(q => (
                    <button key={q} type="button" onClick={() => addQuickNote(q)}>{q}</button>
                  ))}
                </div>
              </div>
            </div>

            {feedback && <FeedbackBar data={feedback} />}

            <button type="submit" disabled={loading || !message.trim()} className="btn btn-cyan ca-cta">
              {loading
                ? <><span className="p-dot pulse" style={{ background: "#fff" }} /> Guardando…</>
                : <><Send size={14} /> Guardar actualización</>}
            </button>
          </form>
        )}

        {/* ═════ Asignar (solo forma) ═════ */}
        {tab === "assign" && (
          <div className="ca-form fade-in">
            <SoonBanner text="La reasignación se conecta en el siguiente paso." />
            <div className="ca-current">
              <span className="ca-avatar" style={{ background: assignedToName ? "var(--blue-dim2)" : "var(--surface-2)", color: assignedToName ? INK : "var(--text-3)" }}>
                {assignedToName ? initials(assignedToName) : "?"}
              </span>
              <div style={{ lineHeight: 1.25 }}>
                <p style={CAP}>Responsable actual</p>
                <p style={{ fontSize: ".88rem", fontWeight: 700, color: assignedToName ? "var(--text-1)" : "var(--text-3)" }}>
                  {assignedToName ?? "Sin asignar"}
                </p>
              </div>
            </div>
            <div>
              <p style={{ ...CAP, marginBottom: 7 }}>Nuevo responsable</p>
              <select disabled className="field text-sm" defaultValue=""><option value="">Selecciona un analista</option></select>
            </div>
            <div>
              <p style={{ ...CAP, marginBottom: 7 }}>Motivo del cambio</p>
              <textarea rows={3} disabled className="field text-sm" placeholder="¿Por qué se reasigna el caso?" />
            </div>
            <button type="button" disabled className="btn btn-cyan ca-cta"><UserCog size={14} /> Asignar caso</button>
          </div>
        )}

        {/* ═════ Escalar ═════ */}
        {tab === "escalate" && (hasEscalation ? (
          <div className="ca-done fade-in">
            <Link2 size={16} /> Este caso ya fue escalado a un proveedor.
          </div>
        ) : (
          <form onSubmit={saveEscalate} className="ca-form fade-in">
            <div>
              <p style={{ ...CAP, marginBottom: 9 }}>Proveedor <span style={{ color: "var(--red)" }}>*</span></p>
              <div className="ca-search">
                <Search size={13} />
                <input value={provQuery} onChange={e => setProvQuery(e.target.value)} placeholder="Buscar proveedor…" />
              </div>
              <div className="ca-provs">
                {filtered.map(p => {
                  const on = provId === p.id;
                  return (
                    <button key={p.id} type="button" onClick={() => setProvId(p.id)} className="ca-prov" data-on={on}>
                      <span className="ca-prov-av">{initials(p.name)}</span>
                      <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)" }}>{p.name}</span>
                        <span style={{ display: "block", fontSize: ".66rem", color: "var(--text-3)" }}>{p.type}</span>
                      </span>
                      <span className="ca-radio" data-on={on}>{on && <CheckCircle2 size={14} color="#fff" strokeWidth={3} />}</span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p style={{ fontSize: ".78rem", color: "var(--text-3)", padding: "10px 4px" }}>Sin resultados.</p>
                )}
              </div>
            </div>

            <div>
              <p style={{ ...CAP, marginBottom: 7 }}>Notas</p>
              <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                className="field text-sm" placeholder="Contexto para el proveedor…" />
            </div>

            {feedback && <FeedbackBar data={feedback} />}

            <button type="submit" disabled={loading || !provId} className="btn ca-cta"
              style={{ background: "#F59E0B", color: "#fff", boxShadow: "0 4px 16px rgba(245,158,11,.3)" }}>
              {loading ? <><span className="p-dot pulse" style={{ background: "#fff" }} /> Escalando…</> : <><Link2 size={14} /> Escalar caso</>}
            </button>
          </form>
        ))}

        {/* ═════ Cerrar (solo forma) ═════ */}
        {tab === "close" && (
          <div className="ca-form fade-in">
            <SoonBanner text="La documentación de cierre se conecta en el siguiente paso." />
            <div>
              <p style={{ ...CAP, marginBottom: 7 }}>Resumen de la solución</p>
              <textarea rows={3} disabled className="field text-sm" placeholder="¿Qué se hizo para resolver el caso?" />
            </div>
            <div>
              <p style={{ ...CAP, marginBottom: 7 }}>Causa raíz</p>
              <textarea rows={2} disabled className="field text-sm" placeholder="¿Qué originó el problema?" />
            </div>
            <div>
              <p style={{ ...CAP, marginBottom: 7 }}>Confirmación del usuario</p>
              <select disabled className="field text-sm" defaultValue=""><option value="">Selecciona una opción</option></select>
            </div>
            <button type="button" disabled className="btn btn-cyan ca-cta"><Lock size={14} /> Cerrar caso</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SoonBanner({ text }: { text: string }) {
  return (
    <div className="ca-note"
         style={{ background: "var(--blue-dim)", color: INK }}>
      <Lock size={12} /> {text}
    </div>
  );
}

function FeedbackBar({ data }: { data: { ok: boolean; msg: string } }) {
  const Icon = data.ok ? CheckCircle2 : AlertTriangle;
  return (
    <div className="ca-note fade-in"
      style={{ background: data.ok ? "var(--green-dim)" : "var(--red-dim)", color: data.ok ? "var(--green)" : "var(--red)" }}>
      <Icon size={13} /> {data.msg}
    </div>
  );
}
