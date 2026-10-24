const config: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  OPEN:             { label: "Abierto",           bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  IN_PROGRESS:      { label: "En gestión",        bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  WAITING_PROVIDER: { label: "Con proveedor",     bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  WAITING_USER:     { label: "Esperando usuario", bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  RESOLVED:         { label: "Resuelto",          bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  CLOSED:           { label: "Cerrado",           bg: "#f8fafc", color: "#64748b", dot: "#cbd5e1" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = config[status] ?? { label: status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 dot-pulse"
        style={{ background: s.dot }}
      />
      {s.label}
    </span>
  );
}
