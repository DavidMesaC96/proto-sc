const config: Record<string, { label: string; className: string }> = {
  OPEN:             { label: "Abierto",           className: "bg-gray-100 text-gray-700" },
  IN_PROGRESS:      { label: "En gestión",        className: "bg-blue-100 text-blue-700" },
  WAITING_PROVIDER: { label: "Esperando prov.",   className: "bg-yellow-100 text-yellow-700" },
  WAITING_USER:     { label: "Esperando usuario", className: "bg-orange-100 text-orange-700" },
  RESOLVED:         { label: "Resuelto",          className: "bg-green-100 text-green-700" },
  CLOSED:           { label: "Cerrado",           className: "bg-slate-100 text-slate-600" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = config[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.className}`}>
      {s.label}
    </span>
  );
}
