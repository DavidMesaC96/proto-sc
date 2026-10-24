"use client";

import { useRouter } from "next/navigation";

interface NavbarProps {
  userName: string;
  userRole: string;
}

const roleLabel: Record<string, string> = {
  REQUESTER: "Usuario",
  ANALYST: "Analista",
  MANAGER: "Responsable",
};

export default function Navbar({ userName, userRole }: NavbarProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between shadow">
      <div>
        <span className="font-bold text-lg">Sistecrédito</span>
        <span className="text-blue-300 text-sm ml-2">· Mesa de Ayuda</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-blue-300">{roleLabel[userRole] ?? userRole}</p>
        </div>
        <button
          onClick={logout}
          className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
