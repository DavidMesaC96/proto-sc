"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const roleLabel: Record<string, string> = {
  REQUESTER: "Usuario", ANALYST: "Analista", MANAGER: "Responsable",
};

export default function UserMenu({ userName, userRole }: { userName: string; userRole: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const initials = userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="topbar-user"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#FFFFFF",
          border: "1.5px solid rgba(0,43,122,.14)",
          cursor: "pointer", padding: "5px 12px 5px 5px",
          borderRadius: 999, transition: "all .15s", height: 42,
          boxShadow: "0 1px 4px rgba(0,43,122,.06)",
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 999, flexShrink: 0,
            background: "#002B7A",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: ".75rem", letterSpacing: ".04em", lineHeight: 1,
          }}>{initials}</div>
          <span style={{
            position: "absolute", bottom: 0, right: 0,
            width: 8, height: 8, borderRadius: 999,
            background: "#00C853", border: "2px solid #fff",
          }} />
        </div>
        <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#0D1B3E" }}>
          {userName.split(" ")[0]}
        </span>
        <ChevronDown size={13} style={{
          color: "#6B7280",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform .2s",
        }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fade-in" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            background: "#FFFFFF",
            border: "1.5px solid rgba(0,43,122,.12)",
            borderRadius: 16, minWidth: 240, zIndex: 50,
            boxShadow: "0 16px 48px rgba(0,43,122,.14)",
            overflow: "hidden",
          }}>
            <div style={{ padding: 18, borderBottom: "1px solid rgba(0,43,122,.08)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 999, flexShrink: 0,
                background: "#002B7A",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: ".95rem", lineHeight: 1,
              }}>{initials}</div>
              <div>
                <p style={{ fontSize: ".92rem", fontWeight: 700, color: "#0D1B3E" }}>{userName}</p>
                <p style={{ fontSize: ".76rem", color: "#6B7280" }}>{roleLabel[userRole] ?? userRole}</p>
              </div>
            </div>
            <div style={{ padding: 8 }}>
              <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="topbar-menu-item"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, color: "#374151", fontSize: ".88rem", textDecoration: "none", transition: "all .15s" }}>
                <Settings size={16} style={{ color: "#6B7280" }} />
                Ajustes
              </Link>
            </div>
            <div style={{ padding: 8, borderTop: "1px solid rgba(0,43,122,.08)" }}>
              <button onClick={logout} className="topbar-menu-item-danger"
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px", borderRadius: 10, color: "var(--red)", fontSize: ".88rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
