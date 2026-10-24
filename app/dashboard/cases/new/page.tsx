"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATS = [
  { value: "INCIDENT", label: "Incidente",  hint: "Algo dejó de funcionar",    icon: "⚡" },
  { value: "REQUEST",  label: "Solicitud",  hint: "Necesito algo nuevo",        icon: "📋" },
  { value: "CHANGE",   label: "Cambio",     hint: "Modificación en un sistema", icon: "🔁" },
];

const PRIOS = [
  { value: "LOW",      label: "Baja",    hint: "Puede esperar días",   color: "#94A3B8" },
  { value: "MEDIUM",   label: "Media",   hint: "Resolver en 24h",      color: "#5B4FE8" },
  { value: "HIGH",     label: "Alta",    hint: "Resolver en 8h",       color: "#EA580C" },
  { value: "CRITICAL", label: "Crítica", hint: "Atención inmediata",   color: "#DC2626" },
];

export default function NewCasePage() {
  const router = useRouter();
  const [form, setForm]     = useState({ title: "", description: "", category: "INCIDENT", priority: "MEDIUM" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim())        errs.title       = "El título es obligatorio";
    if (!form.description.trim())  errs.description = "La descripción es obligatoria";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const res  = await fetch("/api/cases", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErrors({ _: data.error }); return; }
    router.push(`/dashboard/cases/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto anim-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-7" style={{ color: "var(--text-3)" }}>
        <Link href="/dashboard" className="bc-link" style={{ color: "var(--text-3)", textDecoration: "none" }}>
          Soporte
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-1)", fontWeight: 500 }}>Nuevo caso</span>
      </div>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-8 py-7" style={{ borderBottom: "1px solid var(--border)" }}>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-1)" }}>Registrar caso</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            Completa el formulario y te asignaremos un analista.
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="px-8 py-7 space-y-7">

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-1)" }}>
                Título <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                type="text" value={form.title}
                onChange={e => set("title", e.target.value)}
                className={`field ${errors.title ? "err" : ""}`}
                placeholder="Ej: No puedo acceder al sistema de nómina"
                maxLength={120}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs" style={{ color: errors.title ? "var(--red)" : "transparent" }}>
                  {errors.title || "."}
                </span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>{form.title.length}/120</span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-1)" }}>
                Descripción <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <textarea
                rows={5} value={form.description}
                onChange={e => set("description", e.target.value)}
                className={`field resize-none ${errors.description ? "err" : ""}`}
                placeholder="Describe el problema: cuándo ocurrió, qué estabas haciendo, qué error aparece..."
              />
              {errors.description && (
                <p className="text-xs mt-1" style={{ color: "var(--red)" }}>{errors.description}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>
                Tipo de caso
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CATS.map(c => {
                  const active = form.category === c.value;
                  return (
                    <button
                      key={c.value} type="button"
                      onClick={() => set("category", c.value)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--accent-lt)" : "var(--bg)",
                      }}
                    >
                      <span className="text-xl block mb-2">{c.icon}</span>
                      <p className="text-sm font-semibold" style={{ color: active ? "var(--accent)" : "var(--text-1)" }}>
                        {c.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{c.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>
                Prioridad
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PRIOS.map(p => {
                  const active = form.priority === p.value;
                  return (
                    <button
                      key={p.value} type="button"
                      onClick={() => set("priority", p.value)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${active ? p.color : "var(--border)"}`,
                        background: active ? `${p.color}10` : "var(--bg)",
                      }}
                    >
                      <span
                        className="dot flex-shrink-0"
                        style={{ background: active ? p.color : "var(--border-md)" }}
                      />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: active ? p.color : "var(--text-1)" }}>
                          {p.label}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-3)" }}>{p.hint}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {errors._ && (
              <div
                className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl anim-up"
                style={{ background: "var(--red-lt)", color: "var(--red)", border: "1px solid #fecaca" }}
              >
                <span>⚠</span> {errors._}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-8 py-5 flex items-center gap-3"
            style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}
          >
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><span className="spinner" /> Registrando...</> : "Registrar caso →"}
            </button>
            <Link href="/dashboard" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
