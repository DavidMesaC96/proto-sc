const cfg: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  OPEN:             { label: "Abierto",        color: "#64748B", bg: "#F1F5F9", dot: "#94A3B8" },
  IN_PROGRESS:      { label: "En gestión",     color: "#5B4FE8", bg: "#EEF0FF", dot: "#5B4FE8" },
  WAITING_PROVIDER: { label: "Con proveedor",  color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
  WAITING_USER:     { label: "Esp. usuario",   color: "#EA580C", bg: "#FFF7ED", dot: "#F97316" },
  RESOLVED:         { label: "Resuelto",       color: "#16A34A", bg: "#F0FDF4", dot: "#22C55E" },
  CLOSED:           { label: "Cerrado",        color: "#94A3B8", bg: "#F8FAFC", dot: "#CBD5E1" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = cfg[status] ?? { label: status, color: "#64748B", bg: "#F1F5F9", dot: "#94A3B8" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color: s.color, background: s.bg }}
    >
      <span
        className="dot dot-blink"
        style={{ background: s.dot }}
      />
      {s.label}
    </span>
  );
}
