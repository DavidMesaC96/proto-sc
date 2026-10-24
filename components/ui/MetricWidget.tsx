import Link from "next/link";

export type MetricColor = "cyan" | "green" | "amber" | "red" | "purple";

interface MetricWidgetProps {
  label: string;
  value: string | number;
  sub: string;
  Icon: React.ElementType;
  color: MetricColor;
  href: string;
  raw?: number;
}

const ICON_STYLE: Record<MetricColor, { bg: string; border: string; symbol: string }> = {
  cyan:   { bg: "rgba(0,200,83,.10)",    border: "rgba(0,200,83,.20)",    symbol: "#00C853" },
  green:  { bg: "rgba(16,185,129,.10)",  border: "rgba(16,185,129,.20)",  symbol: "#10B981" },
  amber:  { bg: "rgba(245,158,11,.10)",  border: "rgba(245,158,11,.20)",  symbol: "#F59E0B" },
  red:    { bg: "rgba(239,68,68,.10)",   border: "rgba(239,68,68,.20)",   symbol: "#EF4444" },
  purple: { bg: "rgba(139,92,246,.10)",  border: "rgba(139,92,246,.20)",  symbol: "#8B5CF6" },
};

const BAR_COLOR: Record<MetricColor, string> = {
  cyan:   "#00C853",
  green:  "#10B981",
  amber:  "#F59E0B",
  red:    "#EF4444",
  purple: "#8B5CF6",
};

export default function MetricWidget({
  label, value, sub, Icon, color, href, raw = 0,
}: MetricWidgetProps) {
  const pct   = Math.min(raw * 100, 100).toFixed(1);
  const style = ICON_STYLE[color];
  const bar   = BAR_COLOR[color];

  return (
    <Link
      href={href}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        padding: "32px 24px 24px",
        textDecoration: "none", cursor: "pointer",
        background: "#FFFFFF",
        border: "1px solid rgba(0,43,122,.08)",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,43,122,.06)",
        transition: "box-shadow .2s, transform .15s, border-color .2s",
      }}
      className="glass-card-hover"
    >
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 18, marginBottom: 18,
        background: style.bg, border: `1px solid ${style.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} style={{ color: style.symbol }} />
      </div>

      {/* Value */}
      <p style={{
        fontSize: "3rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-.04em",
        marginBottom: 10, color: color === "red" ? "#EF4444" : "#002B7A",
      }}>
        {value}
      </p>

      {/* Label */}
      <p style={{ fontSize: ".85rem", fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>
        {label}
      </p>

      {/* Sub */}
      <p style={{ fontSize: ".75rem", color: "#6B7280", marginBottom: 20, flex: 1 }}>
        {sub}
      </p>

      {/* Progress */}
      <div style={{
        width: "100%", height: 5, borderRadius: 999,
        background: "rgba(0,43,122,.07)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 999,
          width: `${pct}%`, background: bar,
          transition: "width .7s cubic-bezier(.22,1,.36,1)",
        }} />
      </div>
    </Link>
  );
}
