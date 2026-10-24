"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronDown, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const roleLabel: Record<string, string> = {
  REQUESTER: "Usuario", ANALYST: "Analista", MANAGER: "Responsable",
};

export default function TopBar({ userName, userRole }: { userName: string; userRole: string }) {
  const router  = useRouter();
  const [menu, setMenu] = useState(false);
  const initials = userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header style={{
      height: 56,
      minHeight: 56,
      flexShrink: 0,
      zIndex: 30,
      borderBottom: "1px solid var(--border)",
      background: "var(--surface-1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      gap: 12,
    }}>

      {/* ── Search — crece proporcionalmente ── */}
      <button
        onClick={() => router.push("/dashboard/cases")}
        style={{
          flex: 1,
          maxWidth: 440,
          height: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          background: "var(--canvas)",
          border: "1px solid var(--border-md)",
          borderRadius: 10,
          cursor: "pointer",
          transition: "border-color .15s",
          minWidth: 160,
        }}
        className="topbar-search"
      >
        <Search size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <span style={{ color: "var(--text-3)", fontSize: ".82rem", flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Buscar tickets, usuarios...
        </span>
        <kbd style={{
          display: "inline-flex", alignItems: "center",
          background: "var(--surface-2)", color: "var(--text-3)",
          fontSize: ".58rem", padding: "2px 6px", borderRadius: 5,
          border: "1px solid var(--border-md)", fontFamily: "inherit",
          lineHeight: 1.4, flexShrink: 0,
        }}>⌘K</kbd>
      </button>

      {/* ── Grupo derecha ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <div title="Notificaciones próximamente" style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 999,
            background: "var(--surface-2)",
            border: "1px solid var(--border-md)",
            cursor: "default",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 16, height: 16,
            background: "var(--red)", color: "#fff",
            fontSize: ".54rem", fontWeight: 800,
            borderRadius: 999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", border: "2px solid var(--surface-1)", lineHeight: 1,
          }}>3</span>
        </div>

        {/* Avatar + dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenu(!menu)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none",
              cursor: "pointer",
              padding: "3px 6px 3px 3px",
              borderRadius: 999,
              transition: "background .15s",
              height: 36,
            }}
            className="topbar-user"
          >
            <div style={{ position: "relative" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                background: "linear-gradient(135deg, var(--cyan) 0%, #0284c7 100%)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: ".68rem", letterSpacing: ".04em", lineHeight: 1,
              }}>{initials}</div>
              <span style={{
                position: "absolute", bottom: 0, right: 0,
                width: 7, height: 7, borderRadius: 999,
                background: "var(--green)", border: "2px solid var(--surface-1)",
              }} />
            </div>
            <ChevronDown size={11} style={{
              color: "var(--text-3)",
              transform: menu ? "rotate(180deg)" : "none",
              transition: "transform .2s",
            }} />
          </button>

          {menu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
              <div className="fade-in" style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "var(--surface-1)",
                border: "1px solid var(--border-md)",
                borderRadius: 16, minWidth: 220, zIndex: 50,
                boxShadow: "0 16px 48px rgba(0,0,0,.7)", overflow: "hidden",
              }}>
                <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 999, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--cyan) 0%, #0284c7 100%)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: ".8rem", lineHeight: 1,
                  }}>{initials}</div>
                  <div>
                    <p style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-1)" }}>{userName}</p>
                    <p style={{ fontSize: ".68rem", color: "var(--text-3)" }}>{roleLabel[userRole]}</p>
                  </div>
                </div>
                <div style={{ padding: 6 }}>
                  <Link href="/dashboard/settings" onClick={() => setMenu(false)} className="topbar-menu-item"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, color: "var(--text-2)", fontSize: ".82rem", textDecoration: "none" }}>
                    <Settings size={14} style={{ color: "var(--text-3)" }} />
                    Ajustes
                  </Link>
                </div>
                <div style={{ padding: 6, borderTop: "1px solid var(--border)" }}>
                  <button onClick={logout} className="topbar-menu-item-danger"
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, color: "var(--red)", fontSize: ".82rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nuevo ticket */}
        <Link href="/dashboard/cases/new" className="topbar-new-btn" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "0 16px", height: 34,
          background: "var(--cyan)", color: "#0A0F1A",
          borderRadius: 999, fontWeight: 800, fontSize: ".78rem",
          textDecoration: "none",
          boxShadow: "0 0 0 1px rgba(56,189,248,.4), 0 4px 14px rgba(56,189,248,.25)",
          transition: "opacity .15s",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          <Plus size={13} strokeWidth={2.5} />
          Nuevo ticket
        </Link>

      </div>
    </header>
  );
}
