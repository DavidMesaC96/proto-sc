const CFG: Record<string, { label: string; color: string; bg: string }> = {
  LOW:      { label: "Baja",    color: "#6B7280", bg: "rgba(107,114,128,.08)" },
  MEDIUM:   { label: "Media",   color: "#2563EB", bg: "rgba(59,130,246,.10)"  },
  HIGH:     { label: "Alta",    color: "#D97706", bg: "rgba(245,158,11,.10)"  },
  CRITICAL: { label: "Crítica", color: "#DC2626", bg: "rgba(239,68,68,.10)"   },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const p = CFG[priority] ?? { label: priority, color: "#6B7280", bg: "rgba(107,114,128,.08)" };
  return (
    <span className="pill" style={{ color: p.color, background: p.bg }}>
      {p.label}
    </span>
  );
}
