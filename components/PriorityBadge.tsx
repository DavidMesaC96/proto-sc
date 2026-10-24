const config: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  LOW:      { label: "Baja",    bg: "#f8fafc", color: "#64748b", icon: "↓" },
  MEDIUM:   { label: "Media",   bg: "#eff6ff", color: "#1d4ed8", icon: "→" },
  HIGH:     { label: "Alta",    bg: "#fff7ed", color: "#c2410c", icon: "↑" },
  CRITICAL: { label: "Crítica", bg: "#fef2f2", color: "#b91c1c", icon: "‼" },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const p = config[priority] ?? { label: priority, bg: "#f1f5f9", color: "#475569", icon: "·" };
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: p.bg, color: p.color }}
    >
      <span className="font-bold">{p.icon}</span>
      {p.label}
    </span>
  );
}
