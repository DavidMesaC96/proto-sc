"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props { caseId: string; currentStatus: string; hasEscalation: boolean; userId: string; }
interface Provider { id: string; name: string; type: string; }

const statuses = [
  { value: "OPEN",             label: "Abierto",           color: "#475569" },
  { value: "IN_PROGRESS",      label: "En gestión",        color: "#1d4ed8" },
  { value: "WAITING_USER",     label: "Esperando usuario", color: "#c2410c" },
  { value: "RESOLVED",         label: "Resuelto",          color: "#15803d" },
  { value: "CLOSED",           label: "Cerrado",           color: "#64748b" },
];

export default function CaseActions({ caseId, currentStatus, hasEscalation }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"update" | "escalate">("update");
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState("");
  const [escalateNotes, setEscalateNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/providers").then(r => r.json()).then(setProviders);
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { setError("Escribe un comentario antes de guardar"); return; }
    setLoading(true); setError(""); setSuccess("");
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, message }),
    });
    setLoading(false);
    if (!res.ok) { setError("No se pudo actualizar el caso"); return; }
    setMessage("");
    setSuccess("Caso actualizado correctamente");
    setTimeout(() => { setSuccess(""); router.refresh(); }, 1200);
  }

  async function handleEscalate(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) { setError("Selecciona un proveedor"); return; }
    setLoading(true); setError(""); setSuccess("");
    const res = await fetch(`/api/cases/${caseId}/escalate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, notes: escalateNotes }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Error al escalar"); return; }
    setSuccess("Caso escalado al proveedor");
    setTimeout(() => { setSuccess(""); router.refresh(); }, 1200);
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => { setTab("update"); setError(""); setSuccess(""); }}
          className="flex-1 py-3 text-xs font-semibold transition-all"
          style={{
            color: tab === "update" ? "#1d4ed8" : "#94a3b8",
            borderBottom: tab === "update" ? "2px solid #1d4ed8" : "2px solid transparent",
            background: tab === "update" ? "#fafbff" : "transparent",
          }}
        >
          ✏ Actualizar
        </button>
        {!hasEscalation && (
          <button
            onClick={() => { setTab("escalate"); setError(""); setSuccess(""); }}
            className="flex-1 py-3 text-xs font-semibold transition-all"
            style={{
              color: tab === "escalate" ? "#d97706" : "#94a3b8",
              borderBottom: tab === "escalate" ? "2px solid #d97706" : "2px solid transparent",
              background: tab === "escalate" ? "#fffbeb" : "transparent",
            }}
          >
            🔗 Escalar
          </button>
        )}
      </div>

      <div className="p-5">
        {tab === "update" && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Cambiar estado
              </label>
              <div className="space-y-1.5">
                {statuses.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className="btn-press w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm"
                    style={{
                      background: status === s.value ? "#eff6ff" : "#fafafa",
                      border: `1.5px solid ${status === s.value ? "#1d4ed8" : "#f1f5f9"}`,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: status === s.value ? s.color : "#e2e8f0" }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: status === s.value ? s.color : "#64748b" }}
                    >
                      {s.label}
                    </span>
                    {status === s.value && (
                      <span className="ml-auto text-blue-600 text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Comentario <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={e => { setMessage(e.target.value); setError(""); }}
                className={`input-base resize-none text-sm ${error ? "error" : ""}`}
                placeholder="Describe la acción realizada..."
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                <span>✓</span> {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full text-white font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : "Guardar"}
            </button>
          </form>
        )}

        {tab === "escalate" && (
          <form onSubmit={handleEscalate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Proveedor <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {providers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProviderId(p.id)}
                    className="btn-press w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: providerId === p.id ? "#fffbeb" : "#fafafa",
                      border: `1.5px solid ${providerId === p.id ? "#d97706" : "#f1f5f9"}`,
                    }}
                  >
                    <span className="text-lg">🏢</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.type}</p>
                    </div>
                    {providerId === p.id && <span className="text-amber-600 font-bold text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Notas para el proveedor
              </label>
              <textarea
                rows={3}
                value={escalateNotes}
                onChange={e => setEscalateNotes(e.target.value)}
                className="input-base resize-none text-sm"
                placeholder="Contexto adicional para el proveedor..."
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span> {error}</p>
            )}
            {success && (
              <p className="text-xs text-green-600 flex items-center gap-1 animate-fade-in"><span>✓</span> {success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #d97706, #f59e0b)",
                boxShadow: "0 2px 8px rgba(217,119,6,0.3)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Escalando...
                </>
              ) : "🔗 Escalar caso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
