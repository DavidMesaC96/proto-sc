const config: Record<string, { label: string; className: string }> = {
  LOW:      { label: "Baja",     className: "bg-slate-100 text-slate-600" },
  MEDIUM:   { label: "Media",    className: "bg-blue-100 text-blue-600" },
  HIGH:     { label: "Alta",     className: "bg-orange-100 text-orange-700" },
  CRITICAL: { label: "Crítica",  className: "bg-red-100 text-red-700" },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const p = config[priority] ?? { label: priority, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.className}`}>
      {p.label}
    </span>
  );
}
