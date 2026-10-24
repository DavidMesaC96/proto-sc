"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const roleLabel: Record<string, string> = {
  REQUESTER: "Usuario", ANALYST: "Analista", MANAGER: "Responsable",
};

export default function Navbar({ userName, userRole }: { userName: string; userRole: string }) {
  const router = useRouter();
  const initials = userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        height: "56px",
        position: "sticky", top: 0, zIndex: 40,
      }}
    >
      <div
        className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ background: "var(--accent)", fontSize: ".7rem" }}
          >
            SC
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
            Sistecrédito
          </span>
          <span
            className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "var(--accent-lt)", color: "var(--accent)" }}
          >
            Mesa de Ayuda
          </span>
        </Link>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-1)" }}>{userName}</p>
            <p className="text-xs leading-tight" style={{ color: "var(--text-3)" }}>{roleLabel[userRole] ?? userRole}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent-lt)", color: "var(--accent)" }}
          >
            {initials}
          </div>
          <button
            onClick={logout}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
