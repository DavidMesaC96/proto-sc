const cfg: Record<string, { label: string; color: string; bg: string }> = {
  LOW:      { label: "Baja",    color: "#94A3B8", bg: "#F8FAFC" },
  MEDIUM:   { label: "Media",   color: "#5B4FE8", bg: "#EEF0FF" },
  HIGH:     { label: "Alta",    color: "#EA580C", bg: "#FFF7ED" },
  CRITICAL: { label: "Crítica", color: "#DC2626", bg: "#FEF2F2" },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const p = cfg[priority] ?? { label: priority, color: "#94A3B8", bg: "#F8FAFC" };
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color: p.color, background: p.bg }}
    >
      {p.label}
    </span>
  );
}
