"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Ticket, Siren, BookOpen,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Activity, Plus, Users,
} from "lucide-react";
import { useState } from "react";

const ALL_NAV = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard",  roles: ["REQUESTER", "ANALYST", "MANAGER"] },
  { href: "/dashboard/cases",     icon: Ticket,          label: "Tickets",    roles: ["REQUESTER", "ANALYST", "MANAGER"] },
  { href: "/dashboard/incidents", icon: Siren,           label: "Incidentes", roles: ["ANALYST", "MANAGER"]              },
  { href: "/dashboard/catalog",   icon: BookOpen,        label: "Catálogo",   roles: ["REQUESTER", "ANALYST", "MANAGER"] },
  { href: "/dashboard/reports",   icon: BarChart2,       label: "Reportes",   roles: ["MANAGER"]                         },
  { href: "/dashboard/users",     icon: Users,           label: "Usuarios",   roles: ["ANALYST", "MANAGER"]              },
];

const ROLE_LABEL: Record<string, string> = {
  REQUESTER: "Usuario", ANALYST: "Analista", MANAGER: "Responsable",
};

export default function Sidebar({ userRole, userName }: { userRole: string; userName?: string }) {
  const path      = usePathname();
  const [col, setCol] = useState(false);

  const nav = ALL_NAV.filter(item => item.roles.includes(userRole));
  const initials = userName
    ? userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <aside style={{
      width: col ? 60 : 260,
      minWidth: col ? 60 : 260,
      background: "#002B7A",
      borderRight: "none",
      display: "flex",
      flexDirection: "column",
      transition: "width .2s ease, min-width .2s ease",
      overflow: "hidden",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxShadow: "4px 0 24px rgba(0,43,122,.18)",
    }}>

      {/* ── Logo ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: col ? "12px 0" : "16px 12px",
        borderBottom: "1px solid rgba(255,255,255,.1)",
        minHeight: 76,
      }}>
        {!col ? (
          /* Expanded — logo sobre sidebar azul, filtro blanco para contraste */
          <img
            src="/logo-sistecredito.png"
            alt="Sistecrédito"
            style={{
              width: "calc(100% - 20px)",
              height: "auto",
              objectFit: "contain",
              display: "block",
              filter: "brightness(0) invert(1)",
            }}
          />
        ) : (
          /* Collapsed — símbolo "+" en verde */
          <div style={{
            width: 36, height: 36,
            background: "#00C853",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="7.5" y="1" width="3" height="16" rx="1.5" fill="#002B7A"/>
              <rect x="1" y="7.5" width="16" height="3" rx="1.5" fill="#002B7A"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href} href={href}
              title={col ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: col ? "10px 0" : "9px 10px",
                justifyContent: col ? "center" : "flex-start",
                borderRadius: 14,
                textDecoration: "none",
                transition: "background .15s",
                background: active ? "rgba(0,200,83,.14)" : "transparent",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {/* Icon tile */}
              <div style={{
                width: 40, height: 40,
                borderRadius: 12,
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "#00C853" : "rgba(255,255,255,.10)",
                boxShadow: active ? "0 4px 14px rgba(0,200,83,.35)" : "none",
                transition: "background .15s, box-shadow .15s",
              }}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,.75)" }}
                />
              </div>

              {/* Label */}
              {!col && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{
                    fontSize: "clamp(.78rem, .9vw, .95rem)",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#FFFFFF" : "rgba(255,255,255,.70)",
                    lineHeight: 1.2,
                  }}>
                    {label}
                  </span>
                </div>
              )}

              {/* Active indicator bar */}
              {active && !col && (
                <div style={{
                  marginLeft: "auto",
                  width: 4, height: 28,
                  borderRadius: 99,
                  background: "#00C853",
                  boxShadow: "0 0 8px rgba(0,200,83,.6)",
                  flexShrink: 0,
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Health Status card ── */}
      <div style={{ margin: "0 10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <Link
          href="/dashboard/health"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "13px 14px",
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.10)",
            borderRadius: 14,
            textDecoration: "none",
            transition: "background .15s, border-color .15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.10)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,83,.30)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)";
          }}
        >
          {/* Pulse dot */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(0,200,83,.15)",
              border: "1px solid rgba(0,200,83,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Activity size={17} strokeWidth={2} style={{ color: "#00C853" }} />
            </div>
            {/* live pulse ring */}
            <span style={{
              position: "absolute", top: -2, right: -2,
              width: 9, height: 9, borderRadius: "50%",
              background: "#00C853",
              boxShadow: "0 0 0 2px #002B7A",
            }} />
          </div>

          {col ? null : (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "clamp(.72rem, .85vw, .82rem)", fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                Health Status
              </p>
              <p style={{ fontSize: "clamp(.58rem, .7vw, .68rem)", color: "rgba(255,255,255,.45)", letterSpacing: ".01em" }}>
                Sauron · Grafana Stack
              </p>
            </div>
          )}
        </Link>

        {/* Nuevo ticket */}
        <Link
          href="/dashboard/cases/new"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: col ? "10px 0" : "9px 14px",
            background: "#00C853", color: "#002B7A",
            borderRadius: 99, fontSize: ".78rem", fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0,200,83,.30)",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          {!col && "Nuevo ticket"}
        </Link>
      </div>

      {/* ── User mini card ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,.1)",
        padding: col ? "12px 0" : "12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        {!col && userName && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            background: "rgba(255,255,255,.07)",
            borderRadius: 12,
            marginBottom: 4,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 999, flexShrink: 0,
              background: "#00C853",
              color: "#002B7A",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "clamp(.62rem, .7vw, .75rem)", lineHeight: 1,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "clamp(.78rem, .9vw, .9rem)", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName.split(" ")[0]}
              </p>
              <p style={{ fontSize: "clamp(.62rem, .7vw, .7rem)", color: "rgba(255,255,255,.5)" }}>{ROLE_LABEL[userRole] ?? userRole}</p>
            </div>
          </div>
        )}

        <Link
          href="/dashboard/settings"
          title={col ? "Ajustes" : undefined}
          style={{
            display: "flex", alignItems: "center", gap: 13,
            padding: col ? "10px 0" : "9px 10px",
            justifyContent: col ? "center" : "flex-start",
            borderRadius: 14, textDecoration: "none",
            transition: "background .15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,.10)",
          }}>
            <Settings size={21} strokeWidth={1.8} style={{ color: "rgba(255,255,255,.75)" }} />
          </div>
          {!col && (
            <span style={{ fontSize: "clamp(.78rem, .9vw, .95rem)", fontWeight: 500, color: "rgba(255,255,255,.70)" }}>
              Ajustes
            </span>
          )}
        </Link>

        <button
          onClick={() => setCol(!col)}
          style={{
            display: "flex", alignItems: "center", gap: 13,
            padding: col ? "10px 0" : "9px 10px",
            justifyContent: col ? "center" : "flex-start",
            borderRadius: 14, border: "none", background: "transparent",
            cursor: "pointer", width: "100%",
            transition: "background .15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,.07)",
          }}>
            {col
              ? <ChevronRight size={19} strokeWidth={1.8} style={{ color: "rgba(255,255,255,.50)" }} />
              : <ChevronLeft  size={19} strokeWidth={1.8} style={{ color: "rgba(255,255,255,.50)" }} />}
          </div>
          {!col && (
            <span style={{ fontSize: "clamp(.78rem, .9vw, .95rem)", fontWeight: 500, color: "rgba(255,255,255,.45)" }}>
              Colapsar
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
