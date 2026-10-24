"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavbarProps {
  userName: string;
  userRole: string;
}

const roleLabel: Record<string, { label: string; color: string }> = {
  REQUESTER: { label: "Usuario",      color: "#93c5fd" },
  ANALYST:   { label: "Analista",     color: "#86efac" },
  MANAGER:   { label: "Responsable",  color: "#fcd34d" },
};

export default function Navbar({ userName, userRole }: NavbarProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const role = roleLabel[userRole] ?? { label: userRole, color: "#e2e8f0" };
  const initials = userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <nav
      className="text-white px-6 py-0 flex items-center justify-between"
      style={{
        background: "linear-gradient(90deg, #0f172a, #1e3a8a)",
        height: "60px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
      }}
    >
      <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          S
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight">Sistecrédito</span>
          <span className="text-blue-400 text-xs ml-1.5">Mesa de Ayuda</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
            style={{ background: role.color }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-xs leading-tight" style={{ color: role.color }}>{role.label}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-press text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          Salir →
        </button>
      </div>
    </nav>
  );
}
