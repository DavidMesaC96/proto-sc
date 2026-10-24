"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
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
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">S</div>
            <span className="text-xl font-bold tracking-tight">Sistecrédito</span>
          </div>
        </div>

        <div className="animate-fade-in stagger-2">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Tu Mesa de Ayuda,<br />
            <span style={{ color: "#93c5fd" }}>siempre contigo.</span>
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-md">
            Gestiona solicitudes, rastrea incidentes y mantén trazabilidad completa con proveedores — todo en un solo lugar.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: "✓", text: "Estado en tiempo real de cada caso" },
              { icon: "✓", text: "Historial completo de actualizaciones" },
              { icon: "✓", text: "Trazabilidad con proveedores externos" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 animate-slide-in stagger-${i + 3}`}>
                <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-blue-300 font-bold flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-blue-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-sm animate-fade-in stagger-6">
          © 2026 Sistecrédito · Mesa de Ayuda v1.0
        </p>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-md animate-scale-in"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: "24px",
            padding: "48px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.3)",
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="font-bold text-gray-800">Sistecrédito</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Bienvenido</h2>
          <p className="text-gray-500 mb-8 text-sm">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base focus-ring pl-9"
                  placeholder="correo@sistecredito.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base focus-ring pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs transition-colors"
                >
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="animate-fade-in flex items-center gap-2 text-sm text-red-700 px-4 py-3 rounded-xl"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
              >
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-60"
              style={{
                background: loading
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Ingresando...
                </span>
              ) : (
                "Ingresar →"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              ¿Problemas para ingresar? Contacta a Mesa de Ayuda interna.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
