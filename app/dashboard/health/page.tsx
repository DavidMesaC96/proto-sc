export const metadata = { title: "Health Status · Mesa de Servicios" };

export default function HealthPage() {
  return (
    <div style={{
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
      background: "#F4F6F8",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* ── Background grid pattern ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.045 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#002B7A" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* ── Corner accent blobs ── */}
      <div style={{
        position: "absolute", top: -120, right: -120,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,83,.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -100, left: -80,
        width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,43,122,.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Main card ── */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 720, width: "100%",
        background: "#FFFFFF",
        border: "1px solid rgba(0,43,122,.08)",
        borderRadius: 24,
        boxShadow: "0 8px 40px rgba(0,43,122,.10)",
        padding: "56px 48px 48px",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
      }}>

        {/* ── Central SVG illustration ── */}
        <div style={{ marginBottom: 36 }}>
          <svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* ── Grid background lines ── */}
            <line x1="0" y1="100" x2="320" y2="100" stroke="#002B7A" strokeOpacity=".06" strokeDasharray="4 4"/>
            <line x1="160" y1="0" x2="160" y2="200" stroke="#002B7A" strokeOpacity=".06" strokeDasharray="4 4"/>

            {/* ── Connection lines between nodes ── */}
            <line x1="160" y1="100" x2="60"  y2="50"  stroke="#002B7A" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="5 3"/>
            <line x1="160" y1="100" x2="260" y2="50"  stroke="#002B7A" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="5 3"/>
            <line x1="160" y1="100" x2="60"  y2="155" stroke="#002B7A" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="5 3"/>
            <line x1="160" y1="100" x2="260" y2="155" stroke="#002B7A" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="5 3"/>
            <line x1="160" y1="100" x2="160" y2="30"  stroke="#00C853" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="5 3"/>

            {/* ── Satellite node — top center (Sauron) ── */}
            <circle cx="160" cy="22" r="18" fill="#002B7A" fillOpacity=".08" stroke="#002B7A" strokeOpacity=".20" strokeWidth="1.5"/>
            <circle cx="160" cy="22" r="10" fill="#002B7A"/>
            {/* eye icon simplified */}
            <ellipse cx="160" cy="22" rx="5" ry="3.5" fill="none" stroke="#00C853" strokeWidth="1.2"/>
            <circle  cx="160" cy="22" r="1.5" fill="#00C853"/>

            {/* ── Central hub ── */}
            <circle cx="160" cy="100" r="28" fill="white" stroke="#002B7A" strokeWidth="2" strokeOpacity=".20"/>
            <circle cx="160" cy="100" r="20" fill="#002B7A"/>
            {/* server rack icon */}
            <rect x="152" y="93" width="16" height="4" rx="1" fill="white" fillOpacity=".9"/>
            <rect x="152" y="100" width="16" height="4" rx="1" fill="white" fillOpacity=".6"/>
            <rect x="152" y="107" width="16" height="4" rx="1" fill="white" fillOpacity=".3"/>
            <circle cx="165" cy="95" r="1" fill="#00C853"/>
            <circle cx="165" cy="102" r="1" fill="#00C853" fillOpacity=".6"/>

            {/* ── Satellite nodes (4 corners) ── */}
            {/* Top-left */}
            <circle cx="60"  cy="50"  r="22" fill="#F4F6F8" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".15"/>
            <rect x="50" y="42" width="20" height="16" rx="3" fill="none" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".45"/>
            <rect x="52" y="44" width="16" height="3" rx="1" fill="#002B7A" fillOpacity=".25"/>
            <rect x="52" y="49" width="10" height="3" rx="1" fill="#00C853" fillOpacity=".55"/>
            <rect x="52" y="54" width="13" height="3" rx="1" fill="#002B7A" fillOpacity=".20"/>

            {/* Top-right */}
            <circle cx="260" cy="50"  r="22" fill="#F4F6F8" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".15"/>
            <rect x="250" y="40" width="20" height="20" rx="3" fill="none" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".45"/>
            {/* chart bars */}
            <rect x="253" y="52" width="4" height="6"  rx="1" fill="#002B7A" fillOpacity=".30"/>
            <rect x="259" y="47" width="4" height="11" rx="1" fill="#00C853" fillOpacity=".65"/>
            <rect x="265" y="50" width="4" height="8"  rx="1" fill="#002B7A" fillOpacity=".25"/>

            {/* Bottom-left */}
            <circle cx="60"  cy="155" r="22" fill="#F4F6F8" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".15"/>
            {/* circuit paths */}
            <path d="M50 155 H57 V147 H70" stroke="#002B7A" strokeWidth="1.4" strokeOpacity=".35" fill="none"/>
            <path d="M50 161 H57 V163 H70" stroke="#00C853" strokeWidth="1.4" strokeOpacity=".55" fill="none"/>
            <circle cx="57" cy="155" r="2" fill="#002B7A" fillOpacity=".40"/>
            <circle cx="57" cy="163" r="2" fill="#00C853" fillOpacity=".60"/>
            <circle cx="70" cy="147" r="2" fill="#002B7A" fillOpacity=".25"/>

            {/* Bottom-right */}
            <circle cx="260" cy="155" r="22" fill="#F4F6F8" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".15"/>
            {/* wifi / signal */}
            <path d="M252 160 Q260 150 268 160" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".25" fill="none" strokeLinecap="round"/>
            <path d="M255 157 Q260 151 265 157" stroke="#002B7A" strokeWidth="1.5" strokeOpacity=".40" fill="none" strokeLinecap="round"/>
            <path d="M258 154 Q260 152 262 154" stroke="#00C853" strokeWidth="1.5" strokeOpacity=".70" fill="none" strokeLinecap="round"/>
            <circle cx="260" cy="161" r="2" fill="#00C853" fillOpacity=".75"/>

            {/* ── Floating label chips ── */}
            <rect x="18"  y="92" width="30" height="14" rx="7" fill="#002B7A" fillOpacity=".08"/>
            <text x="33"  y="102" fontSize="6" fontFamily="Inter,sans-serif" fill="#002B7A" fillOpacity=".55" textAnchor="middle">Grafana</text>

            <rect x="272" y="92" width="34" height="14" rx="7" fill="#00C853" fillOpacity=".12"/>
            <text x="289" y="102" fontSize="6" fontFamily="Inter,sans-serif" fill="#007A3D" textAnchor="middle">Loki</text>

            <rect x="130" y="170" width="60" height="14" rx="7" fill="#002B7A" fillOpacity=".07"/>
            <text x="160" y="180" fontSize="6" fontFamily="Inter,sans-serif" fill="#002B7A" fillOpacity=".55" textAnchor="middle">Prometheus</text>
          </svg>
        </div>

        {/* ── Badge ── */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px",
          background: "rgba(0,200,83,.08)",
          border: "1px solid rgba(0,200,83,.20)",
          borderRadius: 999,
          marginBottom: 20,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#00C853",
            boxShadow: "0 0 6px #00C853",
            display: "inline-block",
          }}/>
          <span style={{ fontSize: ".72rem", fontWeight: 800, color: "#007A3D", letterSpacing: ".06em" }}>
            SAURON · IDENTIDADES & DESCUBRIMIENTO
          </span>
        </div>

        {/* ── Title ── */}
        <h1 style={{
          fontSize: "2.4rem", fontWeight: 900, lineHeight: 1.1,
          color: "#002B7A", letterSpacing: "-.03em",
          marginBottom: 14,
        }}>
          Health Status
        </h1>

        {/* ── Subtitle ── */}
        <p style={{
          fontSize: "1.05rem", color: "#6B7280", lineHeight: 1.6,
          maxWidth: 480, marginBottom: 36,
        }}>
          Dashboard de monitoreo en tiempo real para los servicios críticos de la compañía,
          integrado con el stack de observabilidad de Grafana.
        </p>

        {/* ── Under construction banner ── */}
        <div style={{
          width: "100%",
          padding: "20px 28px",
          background: "linear-gradient(135deg, rgba(0,43,122,.04) 0%, rgba(0,200,83,.04) 100%)",
          border: "1.5px dashed rgba(0,43,122,.18)",
          borderRadius: 16,
          display: "flex", alignItems: "center", gap: 18,
          marginBottom: 32,
          textAlign: "left",
        }}>
          {/* Hard hat icon */}
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: "rgba(245,158,11,.10)",
            border: "1px solid rgba(245,158,11,.20)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/>
              <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
              <path d="M4 15v-3a8 8 0 0 1 16 0v3"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: ".9rem", fontWeight: 800, color: "#002B7A", marginBottom: 3 }}>
              Sitio en Construcción
            </p>
            <p style={{ fontSize: ".78rem", color: "#6B7280", lineHeight: 1.5 }}>
              Estamos integrando Grafana, Loki, Prometheus y Datadog para traerte visibilidad
              total sobre la infraestructura crítica. Vuelve pronto.
            </p>
          </div>
        </div>

        {/* ── Stack chips ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {[
            { name: "Grafana",      color: "#F46800" },
            { name: "Prometheus",   color: "#E6522C" },
            { name: "Loki",         color: "#002B7A" },
            { name: "Tempo",        color: "#7B3FD4" },
            { name: "Alertmanager", color: "#EF4444" },
            { name: "Datadog",      color: "#632CA6" },
            { name: "Sauron",       color: "#00C853" },
          ].map(s => (
            <span key={s.name} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 13px",
              background: "#F4F6F8",
              border: "1px solid rgba(0,43,122,.08)",
              borderRadius: 999,
              fontSize: ".72rem", fontWeight: 700,
              color: "#374151",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: s.color, flexShrink: 0,
              }}/>
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom footnote ── */}
      <p style={{
        position: "relative", zIndex: 1,
        marginTop: 28,
        fontSize: ".72rem", color: "#9CA3AF",
        letterSpacing: ".03em",
      }}>
        Mesa de Servicios · Sistecrédito — Health Status v0.1 (próximamente)
      </p>
    </div>
  );
}
