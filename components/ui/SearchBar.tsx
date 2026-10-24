"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/dashboard/cases")}
      className="topbar-search"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: 240, height: 42, padding: "0 14px",
        background: "#FFFFFF",
        border: "1.5px solid rgba(0,43,122,.14)",
        borderRadius: 12, cursor: "pointer",
        transition: "border-color .15s, box-shadow .15s",
        flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,43,122,.06)",
      }}
    >
      <Search size={15} style={{ color: "#6B7280", flexShrink: 0 }} />
      <span style={{ color: "#9CA3AF", fontSize: ".88rem", flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>
        Buscar...
      </span>
      <kbd style={{
        display: "inline-flex", alignItems: "center",
        background: "#F4F6F8", color: "#9CA3AF",
        fontSize: ".62rem", padding: "2px 6px", borderRadius: 5,
        border: "1px solid rgba(0,43,122,.12)", fontFamily: "inherit", lineHeight: 1.5, flexShrink: 0,
      }}>⌘K</kbd>
    </button>
  );
}
