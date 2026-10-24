import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mesa de Ayuda · Sistecrédito",
  description: "Sistema de gestión de solicitudes e incidentes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
