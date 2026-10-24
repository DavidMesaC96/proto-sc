"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res  = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Credenciales inválidas"); return; }
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-14"
        style={{
          background: "linear-gradient(160deg, #1A1714 0%, #2D1F6E 100%)",
        }}
      >
        {/* Logo */}
        <div className="anim-up flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}
          >
            SC
          </div>
          <span style={{ color: "rgba(255,255,255,.9)", fontWeight: 600, fontSize: ".95rem" }}>
            Sistecrédito
          </span>
        </div>

        {/* Headline */}
        <div>
          <p
            className="anim-up d1 text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            Mesa de Ayuda
          </p>
          <h1
            className="anim-up d2 font-bold leading-tight mb-6"
            style={{ color: "#fff", fontSize: "2.4rem" }}
          >
            Soporte que<br />
            <span style={{ color: "#A89FFF" }}>llega a tiempo.</span>
          </h1>
          <p className="anim-up d3 text-base" style={{ color: "rgba(255,255,255,.5)", maxWidth: 320, lineHeight: 1.7 }}>
            Trazabilidad completa desde que abres un caso hasta que se cierra. Sin correos perdidos, sin reprocesos.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Estado en tiempo real para cada caso",
              "Escalamiento directo a proveedores",
              "Historial completo e inmutable",
            ].map((t, i) => (
              <div key={t} className={`anim-left d${i + 4} flex items-center gap-3`}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{ background: "rgba(168,159,255,.2)", color: "#A89FFF" }}
                >
                  ✓
                </div>
                <span style={{ color: "rgba(255,255,255,.6)", fontSize: ".875rem" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,.2)", fontSize: ".75rem" }}>
          © 2026 Sistecrédito — v1.0
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="anim-pop w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
              style={{ background: "#5B4FE8", color: "#fff" }}
            >SC</div>
            <span style={{ fontWeight: 600 }}>Sistecrédito</span>
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>
            Acceso al sistema
          </p>
          <h2 className="font-bold mb-8" style={{ fontSize: "1.75rem", color: "var(--text-1)" }}>
            Bienvenido de nuevo
          </h2>

          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "var(--text-2)" }}>
                Correo electrónico
              </label>
              <input
                type="email" required
                value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                className="field"
                placeholder="correo@sistecredito.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "var(--text-2)" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required
                  value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                  className="field pr-16"
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                  style={{ color: "var(--text-3)" }}
                >
                  {showPw ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="anim-up flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                style={{ background: "var(--red-lt)", color: "var(--red)", border: "1px solid #fecaca" }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2" style={{ padding: "12px 20px" }}>
              {loading ? <><span className="spinner" /> Ingresando...</> : "Ingresar →"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: "var(--text-3)" }}>
            ¿Problemas para acceder? Escribe a soporte interno.
          </p>
        </div>
      </div>
    </div>
  );
}
