import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--surface-1)" }}>
      <Sidebar userRole={user.role} userName={user.name} />
      <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</main>
    </div>
  );
}
