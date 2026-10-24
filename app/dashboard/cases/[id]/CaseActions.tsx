"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  caseId: string;
  currentStatus: string;
  hasEscalation: boolean;
  userId: string;
}

interface Provider {
  id: string;
  name: string;
  type: string;
}

const statuses = [
  { value: "OPEN", label: "Abierto" },
  { value: "IN_PROGRESS", label: "En gestión" },
  { value: "WAITING_USER", label: "Esperando usuario" },
  { value: "RESOLVED", label: "Resuelto" },
  { value: "CLOSED", label: "Cerrado" },
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

  useEffect(() => {
    fetch("/api/providers").then((r) => r.json()).then(setProviders);
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { setError("El mensaje es requerido"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, message }),
    });
    setLoading(false);
    if (!res.ok) { setError("Error al actualizar"); return; }
    setMessage("");
    router.refresh();
  }

  async function handleEscalate(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) { setError("Selecciona un proveedor"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/cases/${caseId}/escalate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, notes: escalateNotes }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error al escalar");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setTab("update"); setError(""); }}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            tab === "update" ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Actualizar estado
        </button>
        {!hasEscalation && (
          <button
            onClick={() => { setTab("escalate"); setError(""); }}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === "escalate" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Escalar proveedor
          </button>
        )}
      </div>

      {tab === "update" && (
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Comentario *</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe la acción realizada..."
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar actualización"}
          </button>
        </form>
      )}

      {tab === "escalate" && (
        <form onSubmit={handleEscalate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor *</label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Selecciona un proveedor...</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas de escalamiento</label>
            <textarea
              rows={3}
              value={escalateNotes}
              onChange={(e) => setEscalateNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Contexto para el proveedor..."
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Escalando..." : "Escalar caso"}
          </button>
        </form>
      )}
    </div>
  );
}
