const CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  OPEN:             { label: "Abierto",       color: "#2563EB", bg: "rgba(59,130,246,.10)",  dot: "#3B82F6" },
  IN_PROGRESS:      { label: "En gestión",    color: "#D97706", bg: "rgba(245,158,11,.10)",  dot: "#F59E0B" },
  WAITING_PROVIDER: { label: "Con proveedor", color: "#7C3AED", bg: "rgba(139,92,246,.10)",  dot: "#8B5CF6" },
  WAITING_USER:     { label: "Esp. usuario",  color: "#D97706", bg: "rgba(245,158,11,.10)",  dot: "#F59E0B" },
  RESOLVED:         { label: "Resuelto",      color: "#059669", bg: "rgba(16,185,129,.10)",  dot: "#10B981" },
  CLOSED:           { label: "Cerrado",       color: "#6B7280", bg: "rgba(107,114,128,.10)", dot: "#9CA3AF" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = CFG[status] ?? { label: status, color: "#6B7280", bg: "rgba(107,114,128,.10)", dot: "#9CA3AF" };
  return (
    <span className="pill" style={{ color: s.color, background: s.bg }}>
      <span className="p-dot pulse" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
