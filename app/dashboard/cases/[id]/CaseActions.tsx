"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Building2 } from "lucide-react";

interface Props { caseId: string; currentStatus: string; hasEscalation: boolean; userId: string; }
interface Provider { id: string; name: string; type: string; }

const STATUSES = [
  { value: "OPEN",         label: "Abierto",      color: "var(--text-3)" },
  { value: "IN_PROGRESS",  label: "En gestión",   color: "var(--sky)"   },
  { value: "WAITING_USER", label: "Esp. usuario", color: "var(--amber)" },
  { value: "RESOLVED",     label: "Resuelto",     color: "var(--green)" },
  { value: "CLOSED",       label: "Cerrado",      color: "var(--text-3)" },
];

export default function CaseActions({ caseId, currentStatus, hasEscalation }: Props) {
  const router = useRouter();
  const [tab,        setTab]       = useState<"update" | "escalate">("update");
  const [status,     setStatus]    = useState(currentStatus);
  const [message,    setMessage]   = useState("");
  const [providers,  setProviders] = useState<Provider[]>([]);
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

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface-1)" }}>
        {[
          { id: "update"  as const, label: "Actualizar" },
          ...(!hasEscalation ? [{ id: "escalate" as const, label: "Escalar" }] : []),
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setFeedback(null); }}
            style={{
              flex: 1, padding: "12px 8px", fontSize: ".82rem", fontWeight: 700,
              transition: "all .15s", border: "none", cursor: "pointer",
              color:        tab === t.id ? "#002B7A"   : "var(--text-3)",
              borderBottom: tab === t.id ? "2px solid #002B7A" : "2px solid transparent",
              background:   tab === t.id ? "rgba(0,43,122,.06)" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "update" && (
          <form onSubmit={saveUpdate} className="space-y-3">
            {/* Status list */}
            <div>
              <p className="hint uppercase tracking-widest mb-2" style={{ fontSize: ".62rem" }}>Estado</p>
              <div className="space-y-1">
                {STATUSES.map(s => (
                  <button
                    key={s.value} type="button"
                    onClick={() => setStatus(s.value)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background:   status === s.value ? `${s.color}18` : "transparent",
                      border:       `1px solid ${status === s.value ? s.color : "transparent"}`,
                    }}
                  >
                    <span className="p-dot" style={{ background: status === s.value ? s.color : "var(--text-3)" }} />
                    <span className="font-medium" style={{ color: status === s.value ? s.color : "var(--text-2)" }}>
                      {s.label}
                    </span>
                    {status === s.value && <CheckCircle2 size={11} className="ml-auto" style={{ color: s.color }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="hint uppercase tracking-widest mb-1.5" style={{ fontSize: ".62rem" }}>
                Comentario <span style={{ color: "var(--red)" }}>*</span>
              </p>
              <textarea
                rows={3} value={message}
                onChange={e => setMessage(e.target.value)}
                className="field text-sm"
                placeholder="Describe la acción realizada..."
              />
            </div>

            {feedback && <FeedbackBar data={feedback} />}

            <button type="submit" disabled={loading} className="btn btn-cyan w-full text-sm">
              {loading ? <><span className="p-dot pulse" style={{ background: "#fff" }} /> Guardando...</> : "Guardar"}
            </button>
          </form>
        )}

        {tab === "escalate" && (
          <form onSubmit={saveEscalate} className="space-y-3">
            <div>
              <p className="hint uppercase tracking-widest mb-2" style={{ fontSize: ".62rem" }}>
                Proveedor <span style={{ color: "var(--red)" }}>*</span>
              </p>
              <div className="space-y-1.5">
                {providers.map(p => (
                  <button
                    key={p.id} type="button"
                    onClick={() => setProvId(p.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      background: provId === p.id ? "rgba(245,158,11,.08)" : "var(--surface-1)",
                      border: `1px solid ${provId === p.id ? "var(--amber)" : "var(--border-md)"}`,
                    }}
                  >
                    <Building2 size={13} style={{ color: provId === p.id ? "var(--amber)" : "var(--text-3)", flexShrink: 0 }} />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: "var(--text-1)", fontSize: ".8rem" }}>{p.name}</p>
                      <p className="hint" style={{ fontSize: ".65rem" }}>{p.type}</p>
                    </div>
                    {provId === p.id && <CheckCircle2 size={11} style={{ color: "var(--amber)", flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="hint uppercase tracking-widest mb-1.5" style={{ fontSize: ".62rem" }}>Notas</p>
              <textarea
                rows={3} value={notes}
                onChange={e => setNotes(e.target.value)}
                className="field text-sm"
                placeholder="Contexto para el proveedor..."
              />
            </div>

            {feedback && <FeedbackBar data={feedback} />}

            <button type="submit" disabled={loading}
              className="btn w-full text-sm"
              style={{ background: "var(--amber-dim)", color: "var(--amber)", border: "1px solid rgba(245,158,11,.3)" }}
            >
              {loading ? <><span className="p-dot pulse" style={{ background: "var(--amber)" }} /> Escalando...</> : "🔗 Escalar caso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FeedbackBar({ data }: { data: { ok: boolean; msg: string } }) {
  const Icon = data.ok ? CheckCircle2 : AlertTriangle;
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold fade-in"
      style={{
        background: data.ok ? "var(--green-dim)" : "var(--red-dim)",
        color:      data.ok ? "var(--green)"     : "var(--red)",
      }}
    >
      <Icon size={12} /> {data.msg}
    </div>
  );
}
