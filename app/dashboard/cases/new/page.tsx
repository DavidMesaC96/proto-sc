"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = [
  { value: "INCIDENT", label: "Incidente",  desc: "Algo dejó de funcionar",     icon: "🔥" },
  { value: "REQUEST",  label: "Solicitud",  desc: "Necesito algo nuevo",         icon: "📋" },
  { value: "CHANGE",   label: "Cambio",     desc: "Modificación en un sistema",  icon: "🔄" },
];

const priorities = [
  { value: "LOW",      label: "Baja",    desc: "Puede esperar días",   color: "#64748b", bg: "#f8fafc" },
  { value: "MEDIUM",   label: "Media",   desc: "Atender en 24h",      color: "#1d4ed8", bg: "#eff6ff" },
  { value: "HIGH",     label: "Alta",    desc: "Atender en 8h",       color: "#c2410c", bg: "#fff7ed" },
  { value: "CRITICAL", label: "Crítica", desc: "Atención inmediata",  color: "#b91c1c", bg: "#fef2f2" },
];

export default function NewCasePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", category: "INCIDENT", priority: "MEDIUM" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "El título es obligatorio";
    if (form.title.trim().length > 0 && form.title.trim().length < 5) e.title = "El título debe tener al menos 5 caracteres";
    if (!form.description.trim()) e.description = "La descripción es obligatoria";
    if (form.description.trim().length > 0 && form.description.trim().length < 10) e.description = "Agrega más detalle (mínimo 10 caracteres)";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErrors({ general: data.error }); return; }
    router.push(`/dashboard/cases/${data.id}`);
  }

  function field(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Mis casos</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Nuevo caso</span>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.06)" }}
      >
        {/* Header del form */}
        <div
          className="px-8 py-6 text-white"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}
        >
          <h1 className="text-xl font-bold">Registrar nuevo caso</h1>
          <p className="text-blue-300 text-sm mt-1">Completa todos los campos marcados con *</p>
        </div>

        <div className="bg-white px-8 py-8 space-y-7">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título del caso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => field("title", e.target.value)}
              className={`input-base ${errors.title ? "error" : ""}`}
              placeholder="Ej: No puedo acceder al sistema de nómina"
              maxLength={120}
            />
            <div className="flex justify-between mt-1">
              {errors.title
                ? <p className="text-xs text-red-500">{errors.title}</p>
                : <span />
              }
              <span className="text-xs text-gray-400">{form.title.length}/120</span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => field("description", e.target.value)}
              className={`input-base resize-none ${errors.description ? "error" : ""}`}
              placeholder="Describe el problema con el mayor detalle posible: cuándo ocurrió, qué estabas haciendo, qué mensaje de error aparece..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Categoría</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => field("category", cat.value)}
                  className="btn-press text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: form.category === cat.value ? "#1d4ed8" : "#e2e8f0",
                    background: form.category === cat.value ? "#eff6ff" : "#fafafa",
                  }}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Prioridad</label>
            <div className="grid grid-cols-2 gap-3">
              {priorities.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => field("priority", p.value)}
                  className="btn-press text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3"
                  style={{
                    borderColor: form.priority === p.value ? p.color : "#e2e8f0",
                    background: form.priority === p.value ? p.bg : "#fafafa",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: form.priority === p.value ? p.color : "#cbd5e1" }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: form.priority === p.value ? p.color : "#374151" }}>
                      {p.label}
                    </p>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 text-sm text-red-700 px-4 py-3 rounded-xl animate-fade-in" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <span>⚠</span> {errors.general}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-press flex-1 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar caso →"
              )}
            </button>
            <Link
              href="/dashboard"
              className="btn-press px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 transition-colors flex items-center"
              style={{ border: "1.5px solid #e2e8f0", background: "#fafafa" }}
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
