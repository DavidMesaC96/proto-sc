"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Zap, FileText, RefreshCw } from "lucide-react";

const CATS = [
  { value: "INCIDENT", label: "Incidente",  hint: "Algo dejó de funcionar",    Icon: Zap       },
  { value: "REQUEST",  label: "Solicitud",  hint: "Necesito algo nuevo",        Icon: FileText  },
  { value: "CHANGE",   label: "Cambio",     hint: "Modificar un sistema",       Icon: RefreshCw },
];

const PRIOS = [
  { value: "LOW",      label: "Baja",    hint: "Puede esperar",      color: "var(--text-3)", dot: "#4E6078" },
  { value: "MEDIUM",   label: "Media",   hint: "Resolver en 24h",    color: "var(--sky)",    dot: "#0EA5E9" },
  { value: "HIGH",     label: "Alta",    hint: "Resolver en 8h",     color: "var(--amber)",  dot: "#F59E0B" },
  { value: "CRITICAL", label: "Crítica", hint: "Atención inmediata", color: "var(--red)",    dot: "#EF4444" },
];

interface InitialValues {
  title: string;
  category: string;
  priority: string;
}

export default function NewCaseForm({ initial }: { initial: InitialValues }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title:       initial.title    || "",
    description: "",
    category:    initial.category || "INCIDENT",
    priority:    initial.priority || "MEDIUM",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim())       errs.title       = "Requerido";
    if (!form.description.trim()) errs.description = "Requerido";
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
    <div className="max-w-2xl mx-auto fade-up">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <Link href="/dashboard" className="bc-link" style={{ color: "#6B7280", fontSize: ".82rem", textDecoration: "none" }}>Dashboard</Link>
        <ChevronRight size={12} style={{ color: "#9CA3AF" }} />
        <Link href="/dashboard/cases" className="bc-link" style={{ color: "#6B7280", fontSize: ".82rem", textDecoration: "none" }}>Tickets</Link>
        <ChevronRight size={12} style={{ color: "#9CA3AF" }} />
        <span style={{ color: "#002B7A", fontWeight: 700, fontSize: ".82rem" }}>Nuevo ticket</span>
      </div>

      <div className="card overflow-hidden">
        <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(0,43,122,.08)", background: "#F4F6F8" }}>
          <h1 style={{ fontWeight: 900, fontSize: "1.25rem", color: "#002B7A", letterSpacing: "-.02em" }}>Registrar ticket</h1>
          <p style={{ fontSize: ".8rem", color: "#6B7280", marginTop: 4 }}>Un analista será asignado automáticamente.</p>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="px-7 py-6 space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                Título <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                type="text" value={form.title}
                onChange={e => set("title", e.target.value)}
                className={`field ${errors.title ? "err" : ""}`}
                placeholder="Ej: No puedo acceder al sistema de nómina"
                maxLength={120}
                autoFocus={!form.title}
              />
              <div className="flex justify-between mt-1">
                <span style={{ color: "var(--red)", fontSize: ".75rem" }}>{errors.title ?? ""}</span>
                <span className="hint">{form.title.length}/120</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                Descripción <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <textarea
                rows={5} value={form.description}
                onChange={e => set("description", e.target.value)}
                className={`field ${errors.description ? "err" : ""}`}
                placeholder="Describe el problema en detalle: cuándo ocurrió, qué error ves, qué estabas haciendo..."
              />
              {errors.description && <p style={{ color: "var(--red)", fontSize: ".75rem", marginTop: 4 }}>{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-2)" }}>Tipo</label>
              <div className="grid grid-cols-3 gap-2.5">
                {CATS.map(({ value, label, hint, Icon }) => {
                  const active = form.category === value;
                  return (
                    <button
                      key={value} type="button"
                      onClick={() => set("category", value)}
                      style={{
                        textAlign: "left", padding: 16, borderRadius: 14,
                        transition: "all .2s", cursor: "pointer",
                        background: active ? "rgba(0,200,83,.08)" : "#FFFFFF",
                        border: `1.5px solid ${active ? "#00C853" : "rgba(0,43,122,.12)"}`,
                        boxShadow: active ? "0 2px 12px rgba(0,200,83,.15)" : "0 1px 4px rgba(0,43,122,.04)",
                      }}
                    >
                      <Icon size={18} style={{ marginBottom: 10, color: active ? "#00C853" : "#6B7280", display: "block" }} />
                      <p style={{ fontWeight: 700, fontSize: ".88rem", color: active ? "#007A3D" : "#0D1B3E", marginBottom: 3 }}>
                        {label}
                      </p>
                      <p style={{ fontSize: ".7rem", color: "#6B7280" }}>{hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-2)" }}>Prioridad</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIOS.map(p => {
                  const active = form.priority === p.value;
                  return (
                    <button
                      key={p.value} type="button"
                      onClick={() => set("priority", p.value)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 12, textAlign: "left",
                        transition: "all .2s", cursor: "pointer", width: "100%",
                        background: active ? `${p.dot}12` : "#FFFFFF",
                        border: `1.5px solid ${active ? p.dot : "rgba(0,43,122,.12)"}`,
                        boxShadow: active ? `0 2px 10px ${p.dot}25` : "0 1px 4px rgba(0,43,122,.04)",
                      }}
                    >
                      <span className="p-dot" style={{ background: active ? p.dot : "var(--text-3)" }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: active ? p.color : "var(--text-1)" }}>
                          {p.label}
                        </p>
                        <p className="hint" style={{ fontSize: ".68rem" }}>{p.hint}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {errors._ && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm fade-in"
                style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(239,68,68,.3)" }}
              >
                <span>⚠</span> {errors._}
              </div>
            )}
          </div>

          <div style={{
            padding: "18px 28px", display: "flex", alignItems: "center", gap: 12,
            borderTop: "1px solid rgba(0,43,122,.08)", background: "#F4F6F8",
          }}>
            <button type="submit" disabled={loading} className="btn btn-cyan">
              {loading
                ? <><span className="p-dot pulse" style={{ background: "#fff", width: 6, height: 6 }} /> Registrando...</>
                : "Registrar ticket →"}
            </button>
            <Link href="/dashboard/cases" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
