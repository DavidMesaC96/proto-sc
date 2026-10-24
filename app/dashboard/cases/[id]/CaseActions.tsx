"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props { caseId: string; currentStatus: string; hasEscalation: boolean; userId: string; }
interface Provider { id: string; name: string; type: string; }

const STATUSES = [
  { value: "OPEN",             label: "Abierto",          color: "#94A3B8" },
  { value: "IN_PROGRESS",      label: "En gestión",       color: "#5B4FE8" },
  { value: "WAITING_USER",     label: "Esp. usuario",     color: "#EA580C" },
  { value: "RESOLVED",         label: "Resuelto",         color: "#16A34A" },
  { value: "CLOSED",           label: "Cerrado",          color: "#94A3B8" },
];

export default function CaseActions({ caseId, currentStatus, hasEscalation }: Props) {
  const router = useRouter();
  const [tab,           setTab]          = useState<"update" | "escalate">("update");
  const [status,        setStatus]       = useState(currentStatus);
  const [message,       setMessage]      = useState("");
  const [providers,     setProviders]    = useState<Provider[]>([]);
  const [providerId,    setProviderId]   = useState("");
  const [escNotes,      setEscNotes]     = useState("");
  const [loading,       setLoading]      = useState(false);
  const [feedback,      setFeedback]     = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => { fetch("/api/providers").then(r => r.json()).then(setProviders); }, []);

  function flash(ok: boolean, msg: string) {
    setFeedback({ ok, msg });
    setTimeout(() => { setFeedback(null); if (ok) router.refresh(); }, 1400);
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
    if (!res.ok) { flash(false, "No se pudo actualizar"); return; }
    setMessage(""); flash(true, "Actualizado correctamente");
  }

  async function saveEscalate(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) { flash(false, "Selecciona un proveedor"); return; }
    setLoading(true);
    const res = await fetch(`/api/cases/${caseId}/escalate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, notes: escNotes }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { flash(false, data.error || "Error al escalar"); return; }
    flash(true, "Caso escalado al proveedor");
  }

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        {[
          { id: "update" as const,  label: "Actualizar" },
          ...(!hasEscalation ? [{ id: "escalate" as const, label: "Escalar" }] : []),
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setFeedback(null); }}
            className="flex-1 py-3 text-xs font-semibold transition-colors"
            style={{
              color:        tab === t.id ? "var(--accent)" : "var(--text-3)",
              borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              background:   tab === t.id ? "var(--accent-lt)" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "update" && (
          <form onSubmit={saveUpdate} className="space-y-4">
            {/* Status selector */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "var(--text-3)" }}>
                Estado
              </p>
              <div className="space-y-1.5">
                {STATUSES.map(s => (
                  <button
                    key={s.value} type="button"
                    onClick={() => setStatus(s.value)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm"
                    style={{
                      background:   status === s.value ? `${s.color}12` : "transparent",
                      border:       `1.5px solid ${status === s.value ? s.color : "var(--border)"}`,
                    }}
                  >
                    <span className="dot flex-shrink-0" style={{ background: status === s.value ? s.color : "var(--border-md)" }} />
                    <span className="font-medium" style={{ color: status === s.value ? s.color : "var(--text-2)" }}>
                      {s.label}
                    </span>
                    {status === s.value && (
                      <span className="ml-auto text-xs font-bold" style={{ color: s.color }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-3)" }}>
                Comentario <span style={{ color: "var(--red)" }}>*</span>
              </p>
              <textarea
                rows={3} value={message}
                onChange={e => setMessage(e.target.value)}
                className="field resize-none text-sm"
                placeholder="Describe la acción realizada..."
              />
            </div>

            <Feedback data={feedback} />

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <><span className="spinner" /> Guardando...</> : "Guardar"}
            </button>
          </form>
        )}

        {tab === "escalate" && (
          <form onSubmit={saveEscalate} className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "var(--text-3)" }}>
                Proveedor <span style={{ color: "var(--red)" }}>*</span>
              </p>
              <div className="space-y-2">
                {providers.map(p => (
                  <button
                    key={p.id} type="button"
                    onClick={() => setProviderId(p.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all"
                    style={{
                      border:     `1.5px solid ${providerId === p.id ? "var(--amber)" : "var(--border)"}`,
                      background: providerId === p.id ? "var(--amber-lt)" : "transparent",
                    }}
                  >
                    <span className="text-base">🏢</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>{p.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-3)" }}>{p.type}</p>
                    </div>
                    {providerId === p.id && (
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--amber)" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-3)" }}>
                Notas para el proveedor
              </p>
              <textarea
                rows={3} value={escNotes}
                onChange={e => setEscNotes(e.target.value)}
                className="field resize-none text-sm"
                placeholder="Contexto adicional..."
              />
            </div>

            <Feedback data={feedback} />

            <button type="submit" disabled={loading}
              className="btn w-full"
              style={{ background: "var(--amber)", color: "#fff", boxShadow: "0 2px 8px rgba(217,119,6,.3)" }}
            >
              {loading ? <><span className="spinner" /> Escalando...</> : "🔗 Escalar caso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Feedback({ data }: { data: { ok: boolean; msg: string } | null }) {
  if (!data) return null;
  return (
    <div
      className="flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-lg anim-up"
      style={{
        background: data.ok ? "var(--green-lt)" : "var(--red-lt)",
        color:      data.ok ? "var(--green)"    : "var(--red)",
      }}
    >
      <span>{data.ok ? "✓" : "⚠"}</span> {data.msg}
    </div>
  );
}
