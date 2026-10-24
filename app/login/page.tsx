"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Zap, Link2, BarChart3, ShieldCheck, Landmark } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res  = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Credenciales inválidas"); return; }
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel — Azul institucional ── */}
      <div style={{
        display: "none",
        width: "42%",
        background: "linear-gradient(160deg, #002B7A 0%, #003DA3 60%, #001F5C 100%)",
        padding: "48px 56px",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }} className="lg-flex">
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -100, right: -80,
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,83,.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div className="fade-up" style={{ position: "relative", zIndex: 1 }}>
          <img
            src="/logo-sistecredito.png"
            alt="Sistecrédito"
            style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)", display: "block" }}
          />
          <p style={{ fontSize: ".62rem", color: "rgba(255,255,255,.45)", letterSpacing: ".08em", marginTop: 6 }}>
            IT SERVICE MANAGEMENT
          </p>
        </div>

        {/* Copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontSize: "clamp(.58rem, .7vw, .72rem)", fontWeight: 700, letterSpacing: ".1em",
            color: "#00C853", textTransform: "uppercase", marginBottom: 18,
          }}>
            Mesa de Servicios
          </p>
          <h1 className="fade-up d1" style={{
            fontWeight: 900, fontSize: "clamp(1.6rem, 2.2vw, 2.6rem)", color: "#FFFFFF",
            lineHeight: 1.12, marginBottom: 18, letterSpacing: "-.02em",
          }}>
            Gestión de servicios<br />
            <span style={{ color: "#00C853" }}>con control total.</span>
          </h1>
          <p className="fade-up d2" style={{
            color: "rgba(255,255,255,.65)", fontSize: "clamp(.78rem, .95vw, 1rem)", lineHeight: 1.7, maxWidth: 340,
          }}>
            Cada solicitud, incidente y cambio en un solo lugar. Visibilidad completa para el equipo, respuestas concretas para el usuario.
          </p>

          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { Icon: Zap,       color: "#00C853", text: "Resolución en tiempo real",           sub: "Tickets cerrados en horas, no en días" },
              { Icon: Link2,     color: "#60A5FA", text: "Escalamiento con contexto completo",  sub: "Proveedores reciben todo el historial" },
              { Icon: BarChart3, color: "#A78BFA", text: "SLA y métricas siempre visibles",     sub: "Dashboards en tiempo real para managers" },
            ].map((item, i) => (
              <div key={item.text} className={`fade-up d${i + 3}`} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: "clamp(36px, 3vw, 44px)", height: "clamp(36px, 3vw, 44px)",
                  borderRadius: 12, flexShrink: 0,
                  background: `${item.color}18`, border: `1px solid ${item.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <item.Icon size={18} strokeWidth={2} style={{ color: item.color }} />
                </div>
                <div>
                  <p style={{ fontSize: "clamp(.78rem, .9vw, .92rem)", color: "#FFFFFF", fontWeight: 700, lineHeight: 1.2 }}>{item.text}</p>
                  <p style={{ fontSize: "clamp(.65rem, .75vw, .78rem)", color: "rgba(255,255,255,.50)", marginTop: 2 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: ".65rem", color: "rgba(255,255,255,.35)", position: "relative", zIndex: 1 }}>
          © {new Date().getFullYear()} Sistecrédito S.A. · Todos los derechos reservados.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 24px", background: "#FFFFFF",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="fade-up">

          {/* Logo panel derecho */}
          <div style={{ marginBottom: 36 }}>
            <img
              src="/logo-sistecredito.png"
              alt="Sistecrédito"
              style={{ height: 38, width: "auto", display: "block" }}
            />
            <p style={{ fontSize: ".65rem", color: "#6B7280", marginTop: 5, letterSpacing: ".04em" }}>
              Mesa de Servicios
            </p>
          </div>

          <p style={{ fontSize: "clamp(.6rem, .7vw, .72rem)", fontWeight: 700, letterSpacing: ".1em", color: "#00C853", textTransform: "uppercase", marginBottom: 8 }}>
            Acceso seguro
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem, 2vw, 2rem)", color: "#002B7A", marginBottom: 32, letterSpacing: "-.02em" }}>
            Iniciar sesión
          </h2>

          <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", marginBottom: 7, fontSize: ".85rem", fontWeight: 600, color: "#374151" }}>
                Correo electrónico
              </label>
              <input
                type="email" required value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="field"
                placeholder="correo@sistecredito.com"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 7, fontSize: ".85rem", fontWeight: 600, color: "#374151" }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={show ? "text" : "password"} required value={pw}
                  onChange={e => { setPw(e.target.value); setError(""); }}
                  className="field"
                  style={{ paddingRight: 44 }}
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShow(!show)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#6B7280",
                    display: "flex", alignItems: "center", padding: 0,
                  }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 14px", borderRadius: 12,
                background: "rgba(239,68,68,.08)", color: "#EF4444",
                border: "1px solid rgba(239,68,68,.2)", fontSize: ".85rem", fontWeight: 600,
              }} className="fade-in">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", height: 52, borderRadius: 999,
                background: "#00C853", color: "#FFFFFF",
                border: "none", cursor: "pointer",
                fontWeight: 800, fontSize: ".95rem",
                boxShadow: "0 4px 20px rgba(0,200,83,.30)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .15s", marginTop: 4,
                opacity: loading ? 0.7 : 1,
                fontFamily: "inherit",
              }}
            >
              {loading
                ? <><span className="p-dot pulse" style={{ background: "#fff", width: 7, height: 7 }} /> Verificando...</>
                : <><LogIn size={16} /> Ingresar</>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(0,43,122,.08)" }} />
            <span style={{ fontSize: ".72rem", color: "#9CA3AF" }}>o</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,43,122,.08)" }} />
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".72rem", color: "#6B7280" }}>
              <ShieldCheck size={13} style={{ color: "#00C853" }} />
              Conexión segura
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".72rem", color: "#6B7280" }}>
              <Landmark size={13} style={{ color: "#002B7A" }} />
              Vigilado SFC
            </div>
          </div>

          <p style={{ fontSize: ".7rem", color: "#9CA3AF", textAlign: "center", marginTop: 28 }}>
            ¿Sin acceso? Contacta al administrador del sistema.
          </p>
        </div>
      </div>

      {/* Responsive: show left panel on large screens */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
