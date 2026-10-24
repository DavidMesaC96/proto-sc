import Link from "next/link";
import { Plus } from "lucide-react";
import SearchBar from "./ui/SearchBar";
import UserMenu from "./UserMenu";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  showNewTicket?: boolean;
}

export default function PageHeader({
  title, subtitle, userName, userRole, showNewTicket = true,
}: PageHeaderProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, marginBottom: 28,
      paddingBottom: 24,
      borderBottom: "1px solid rgba(0,43,122,.08)",
    }}>
      {/* Title */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{
          fontSize: "1.85rem", fontWeight: 900, color: "#002B7A",
          letterSpacing: "-.03em", lineHeight: 1.1,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: ".88rem", color: "var(--text-3)", marginTop: 5 }}>{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

        <SearchBar />

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <div
            title="Notificaciones próximamente"
            style={{
              width: 42, height: 42,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 999,
              background: "#FFFFFF",
              border: "1.5px solid rgba(0,43,122,.14)",
              cursor: "default", flexShrink: 0,
              boxShadow: "0 1px 4px rgba(0,43,122,.06)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 18, height: 18,
            background: "var(--red)", color: "#fff", fontSize: ".6rem", fontWeight: 800,
            borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", border: "2px solid var(--surface-1)", lineHeight: 1,
          }}>3</span>
        </div>

        <UserMenu userName={userName} userRole={userRole} />

        {showNewTicket && (
          <Link href="/dashboard/cases/new" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "0 22px", height: 42,
            background: "#00C853", color: "#FFFFFF",
            borderRadius: 999, fontWeight: 800, fontSize: ".88rem",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(0,200,83,.30)",
            transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0,
          }} className="topbar-new-btn">
            <Plus size={15} strokeWidth={2.5} />
            Nuevo ticket
          </Link>
        )}
      </div>
    </div>
  );
}
